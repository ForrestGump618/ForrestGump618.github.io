function fetchCrossDomainContent(targetUrl, elementId, getid, classSubstring, elementType) {
    const proxyUrl = 'https://cors-anywhere.herokuapp.com/';

    fetch(proxyUrl + targetUrl)
        .then(response => {
            if (response.ok) return response.text();
            throw new Error('Network response was not ok.');
        })
        .then(contents => {
            const parser = new DOMParser();
            const doc = parser.parseFromString(contents, 'text/html');
            let filteredHTML = '';

            // Filter elements by ID
            if (getid) {
                const filteredElementsById = doc.querySelectorAll(`[id*="${getid}"]`);
                filteredElementsById.forEach(element => {
                    filteredHTML += element.outerHTML;
                });
            }

            // Filter elements by class containing the specified substring
            if (classSubstring) {
                const filteredElementsByClass = doc.querySelectorAll(`[class*="${classSubstring}"]`);
                filteredElementsByClass.forEach(element => {
                    filteredHTML += element.outerHTML;
                });
            }

            // Filter elements by type
            if (elementType) {
                const filteredElementsByType = doc.querySelectorAll(elementType);
                filteredElementsByType.forEach(element => {
                    filteredHTML += element.outerHTML;
                });
            }

            const displayElement = document.getElementById(elementId);
            displayElement.innerHTML = filteredHTML || "没有找到符合条件的元素。";

        })
        .catch(error => {
            console.error('There has been a problem with your fetch operation:', error);
            document.getElementById(elementId).textContent = "内容加载失败，请检查控制台了解错误信息。";
        });
}
