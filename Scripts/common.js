function displayError(errorMessage, response) {
    let message = document.getElementById('Message');
    message.className = 'message messageError';
    if (response !== undefined) {
        errorMessage += ' - ' + response.status + ' - ' + response.statusText + ' - ' + response.responseText;
    }
    message.innerHTML = errorMessage;
};
function displaySuccess(successMessage) {
    let message = document.getElementById('Message');
    message.className = 'message messageSuccess';
    message.innerHTML = successMessage;
    setTimeout(function () {
        message.className = '';
        message.innerHTML = '';
    }, 3000);
}
function addElementToTableRow(name, type, required, value, cellIndex, tableRow) {
    let element = document.createElement('input');
    element.type = type;
    element.required = required;
    element.name = name;
    //element.onchange = function () { elementChanged(this); }
    if (value !== undefined) {
        element.value = value;
    }
    tableRow.cells[cellIndex].appendChild(element);
}