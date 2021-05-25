function syncHeight (selector1, selector2) {
    document.querySelector(selector1).style.height = `${document.querySelector(selector2).clientHeight}px`
}

/**
 * Synchronize the height of element pairs upon window resizing
 *
 * @param {Array} listOfPairs The list of element pairs to keep synced
 */
export function keepElementsHeightSynced (listOfPairs) {
    for (const pair of listOfPairs) {
        syncHeight(pair[0], pair[1])
    }

    window.addEventListener('resize', () => {
        for (const pair of listOfPairs) {
            syncHeight(pair[0], pair[1])
        }
    })
}

export function downloadFile (filename, content) {
    const dataString = 'data:text/json;charset=utf-8,' + encodeURIComponent(content)
    const downloadNode = document.createElement('a')
    downloadNode.setAttribute('href', dataString)
    downloadNode.setAttribute('download', filename)
    document.body.appendChild(downloadNode)
    downloadNode.click()
    downloadNode.remove()
}

export function selectFile () {
    return new Promise(resolve => {
        const input = document.createElement('input')
        input.type = 'file'

        input.onchange = e => {
            const file = e.target.files[0]
            const reader = new FileReader()
            reader.readAsText(file, 'UTF-8')

            reader.onload = readerEvent => {
                const content = readerEvent.target.result
                resolve(content)
            }
        }

        input.click()
    })
}
