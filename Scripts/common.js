﻿Object.prototype.isNullOrEmpty = function (value) {
    return (!value);  //Extend the native string prototype to return a boolean indicator for a valid value (not undefined, empty, etc)
}
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
    element.name = name;
    if (value !== undefined) {
        element.value = value;
        element.required = required;
        if (cellIndex === 0) {
            addDeleteButton(tableRow);
        }
    }    
    tableRow.cells[cellIndex].appendChild(element);
    return element;
}
function addDeleteButton(tableRow) {
    let deleteButton = document.createElement('a');
    deleteButton.innerHTML = '&#128465;';
    deleteButton.title = 'Delete';
    deleteButton.classList.add('delete');
    deleteButton.onclick = function () {
        let table = tableRow.parentElement;
        table.removeChild(tableRow);
    }
    tableRow.cells[0].appendChild(deleteButton);
}
function tableRowChanged(tableRow) {
    let inputs = tableRow.querySelectorAll("input");
    for (input of inputs) {
        input.required = true;
    }
    if (tableRow.querySelector(".delete") === null) {
        addDeleteButton(tableRow);
    }
}
function allTableRowInputsAreValid(tableRow) {
    let inputs = tableRow.querySelectorAll("input[required]");
    let allInputsAreValid = true;
    for (input of inputs) {
        if (String.isNullOrEmpty(input.value)) {
            allInputsAreValid = false;
            break;
        }
    }
    return allInputsAreValid;
}
