function initCareRequestView() {

   
    loadSelectElement(document.getElementById('CustomerName'), 'customer');
} 
function getCareRequest(careRequestID) {
    let xhttp = new XMLHttpRequest();
    xhttp.open('GET', 'api/careRequest/' + careRequestID, true);
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4) {
            if (this.status === 200) {
                loadCareRequest(JSON.parse(this.responseText));
            }
            else {
                displayError('Error getting Care Request', this);
            }
        }
    };
    xhttp.send();
    xhttp.onerror = function () {
        displayError('Error getting Care Request - onerror event');
    };
}
function loadCareRequest(careRequest) {
    document.getElementById('CareRequestID').value = careRequest.ID;
    selectCustomerName.value = careRequest.CustomerID;
    document.getElementById('StartDate').value = careRequest.StartDate;
    document.getElementById('EndDate').value = careRequest.EndDate;
}