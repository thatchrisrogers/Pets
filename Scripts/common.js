Object.prototype.isNullOrEmpty = function (value) {
    return (!value);  //Extend the native string prototype to return a boolean indicator for a valid value (not undefined, empty, etc)
}
Date.prototype.addDays = function (days) {
    var date = new Date(this.valueOf());
    date.setDate(date.getDate() + days);
    return date;
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
function addElementToTableRow(name, type, className, required, value, cellIndex, tableRow) {
    let element = document.createElement('input');
    element.type = type;
    element.name = name;
    if (className !== undefined) {
        element.classList.add(className);
    }
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
function tableRowChanged(tableRow, callBackFunction) {
    let inputs = tableRow.querySelectorAll("input.userInput");
    for (input of inputs) {
        input.required = true;
    }
    if (tableRow.querySelector(".delete") === null) {
        addDeleteButton(tableRow);
        callBackFunction();
     }
}
function loadSelectElement(selectElement, apiName) {
    let xhttp = new XMLHttpRequest();
    xhttp.open('GET', 'api/' + apiName, true);
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status === 200) {
            let items = JSON.parse(this.responseText);
            let option;
            for (item of items) {
                option = document.createElement("option");
                option.value = item.ID;
                option.text = item.Name;
                selectElement.appendChild(option);
            }
        }
    };
    xhttp.send();
    xhttp.onerror = function () {
        displayError('loadSelectElement - onerror event');
    };
}

