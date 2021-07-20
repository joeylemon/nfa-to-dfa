let warningTimeout

// Close a warning when the close button is clicked
document.querySelectorAll('.delete').forEach(e => e.addEventListener('click', e => {
    e.target.parentElement.style.display = 'none'
}))

function syncHeight (selector1, selector2) {
    document.querySelector(selector1).style.height = `${document.querySelector(selector2).clientHeight}px`
}

/**
 * Synchronize the height of element pairs upon window resizing
 *
 * @param {Array} listOfPairs The list of element pairs to keep synced
 */
export function keepHeightSynced (listOfPairs) {
    for (const pair of listOfPairs) {
        syncHeight(pair[0], pair[1])
    }

    window.addEventListener('resize', () => {
        for (const pair of listOfPairs) {
            syncHeight(pair[0], pair[1])
        }
    })
}

/**
 * Display the given warning element with a message
 *
 * @param {String} message The message to put into the warning
 */
export function showWarning (message) {
    document.querySelector('#warning').style.display = 'block'
    document.querySelector('#warning').querySelector('.notification-body').innerHTML = message

    // Delete the warning after a delay
    if (warningTimeout) { clearTimeout(warningTimeout) }
    warningTimeout = setTimeout(() => {
        document.querySelector('#warning').style.display = 'none'
        warningTimeout = undefined
    }, 4000)
}

/**
 * Download a file onto the user's computer
 *
 * @param {String} filename The name of the file to create
 * @param {String} content The string contents of the file
 */
export function downloadFile (filename, content) {
    const dataString = 'data:text/json;charset=utf-8,' + encodeURIComponent(content)
    const downloadNode = document.createElement('a')
    downloadNode.setAttribute('href', dataString)
    downloadNode.setAttribute('download', filename)
    document.body.appendChild(downloadNode)
    downloadNode.click()
    downloadNode.remove()
}

/**
 * Prompt the user to select a file and return a Promise with the contents
 *
 * @returns {Promise} The contents of the file
 */
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

export function playVideo (selector) {
    const video = document.querySelector(selector)
    video.currentTime = 0
    video.play()
}

export function pauseAllVideos () {
    document.querySelectorAll('video').forEach(e => {
        if (!e.paused) e.pause()
    })
}
