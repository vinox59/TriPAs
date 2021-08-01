// @ts-nocheck
// This script will be run within the webview itself
// It cannot access the main VS Code APIs directly.

(function () {
    const vscode = acquireVsCodeApi();

    const oldState = /** @type {{ count: number} | undefined} */ (vscode.getState());

    const counter = /** @type {HTMLElement} */ (document.getElementById('lines-of-code-counter'));
    const style = document.getElementById('style');
    const tfs = document.getElementById('tfs');
    const lint = document.getElementById('lint');
    let azdoContent = /** @type {HTMLElement} */ document.getElementById('azdoContent');
    const task = document.getElementById('task');
    let currentCount = (oldState && oldState.count) || 0;
    let currentData = '';
    let azdoResponseData;
    let azdoIndividualData = [];
    const tbodyContent = document.getElementById('tbodyContent');

    let user = '';
    let token = 'i37vpq7gtuhiolhb74omkqrr6pglxvepiezyvcj22ys24l4bnfna';
    counter.textContent = `${currentCount}`;
    setInterval(() => {
        counter.textContent = `${currentCount++} `;

        // Update state
        vscode.setState({ count: currentCount, data: currentData });

        // Alert the extension when the cat introduces a bug
        if (Math.random() < Math.min(0.001 * currentCount, 0.05)) {
            // Send a message back to the extension
            vscode.postMessage({
                command: 'alert',
                text: '🐛  on line ' + currentCount
            });
        }
    }, 10000);

    // Handle messages sent from the extension to the webview
    window.addEventListener('message', event => {
        const message = event.data; // The json data that the extension sent
        switch (message.command) {
            case 'refactor':
                currentCount = Math.ceil(currentCount * 0.5);
                counter.textContent = `${currentCount}`;
            break;
            case 'AZdoData':
                console.log("Response Data::",message.text.workItems);
                azdoResponseData = message.text.workItems;
                if(azdoResponseData.length > 0) {
                    for(let i=0; i<azdoResponseData.length; i++) {
                        vscode.postMessage({'command':'get','text':azdoResponseData[i].url})
                    }
                }
                //azdoContent.innerHTML =  message.text;
            break;  
            case 'getData':
                console.log("Ind Data::",message.text);
                azdoIndividualData.push(message.text);
                if(azdoResponseData.length === azdoIndividualData.length) {
                    let tr;
                    for(let j=0; j< azdoIndividualData.length; j++) {
                        tr += `<tr><td><a href="https://dev.azure.com/TriZettoT3/Facets/_workitems/edit/${azdoIndividualData[j].id}">${azdoIndividualData[j].fields['System.Title']}</a></td><td>${azdoIndividualData[j].fields['System.ChangedDate']}</td><td>${azdoIndividualData[j].fields['System.State']}</td><td>${azdoIndividualData[j].fields['Microsoft.VSTS.Scheduling.OriginalEstimate']}</td><td>${azdoIndividualData[j].fields['Microsoft.VSTS.Scheduling.CompletedWork']}</td><td>${azdoIndividualData[j].fields['Microsoft.VSTS.Scheduling.OriginalEstimate']}</td></tr>`;
                    }
                    
                    console.log(tr);
                }
            break;
        }
    });

    style?.addEventListener('click', fnStyleCollision);

    function fnStyleCollision() {
        vscode.postMessage({
            command: 'style', text: "Style Collision is Initiated"
        });
       
    }

    tfs?.addEventListener('click', fnlaunchTFS);

    function fnlaunchTFS() {
        vscode.postMessage({
            command: 'tfs', text: 'TFS is going to launch'
        })
    }

    lint?.addEventListener('click', fnLint);

    function fnLint() {
        vscode.postMessage({
            command: 'lint', text: 'Lint Initated'
        })
    }
    
}());

