function initCareRequestView() {
    loadSelectElement(document.getElementById('Customer'), 'customer');
    getCareRequest(3); //  ToDo - This is hard coded for testing.  Fix!
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
    let careRequestForm = document.forms.namedItem("CareRequestForm");
    careRequestForm.CareRequestID.value = careRequest.ID;
    careRequestForm.Customer.value = careRequest.CustomerID;
    careRequestForm.StartDate.value = careRequest.StartDate;
    careRequestForm.EndDate.value = careRequest.EndDate;
}