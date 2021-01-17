let todaysDate = new Date(); 
let months = [{ value: 1, text: 'January' }, { value: 2, text: 'February' }, { value: 3, text: 'March' }, { value: 4, text: 'April' }, { value: 5, text: 'May' }, { value: 6, text: 'June' }, { value: 7, text: 'July' }, { value: 8, text: 'August' }, { value: 9, text: 'September' }, { value: 10, text: 'October' }, { value: 11, text: 'November' }, { value: 12, text: 'December' } ];
let selectMonth;
let selectYear;
let selectBusiness;
let businessUnavailableDates = [];

function initbusinessCalendarView() {
    selectBusiness = document.getElementById('SelectBusiness');
    loadSelectElement(selectBusiness, businessListItems, false);
    getBusinessUnavailableDates();
    let currentMonth = todaysDate.getMonth() + 1;
    let currentYear = todaysDate.getFullYear();
    selectMonth = document.getElementById('SelectMonth');
    selectYear = document.getElementById('SelectYear');

    let optionMonth;
    for (selectedMonth of months) {
        optionMonth = document.createElement('option');
        optionMonth.value = selectedMonth.value;
        optionMonth.text = selectedMonth.text;
        selectMonth.appendChild(optionMonth);
    }
    selectMonth.value = currentMonth;

    let optionYear;
    for (let i = -1; i <= 1; i++) {
        optionYear = document.createElement('option');
        optionYear.text = currentYear + i;
        optionYear.value = currentYear + i;
        selectYear.appendChild(optionYear);
        optionYear = document.createElement('option');
    }
    selectYear.value = currentYear;
    getCareRequests(loadCalendar);
}
function changeMonthYear() {
    getCareRequests(loadCalendar);
}
function changeMonth(gotoMonth) {
    let selectedMonth = parseInt(selectMonth.value);
    let selectedYear = parseInt(selectYear.value);
    if (gotoMonth === 1) {
        gotoMonth = (selectedMonth === 12) ? 1 : selectedMonth + 1;
        gotoYear = (selectedMonth === 12) ? selectedYear + 1 : selectedYear;
    } else if (gotoMonth === -1) {
        gotoMonth = (selectedMonth === 1) ? 12 : selectedMonth - 1;
        gotoYear = (selectedMonth === 1) ? selectedYear - 1 : selectedYear;
    }
    selectMonth.value = gotoMonth;
    selectYear.value = gotoYear;
    changeMonthYear();
}
function loadCalendar() {
    let selectedMonth = parseInt(selectMonth.value - 1);
    let selectedYear = parseInt(selectYear.value);
    let firstDayOfMonth = (new Date(selectedYear, selectedMonth)).getDay();
    let calendarBody = document.getElementById('CalendarBody');
    calendarBody.innerHTML = '';   // clearing all previous cells
    // creating all cells
    let dayOfMonth = 1;
    let daysInMonth = 32 - new Date(selectedYear, selectedMonth, 32).getDate();
    let calendarDay;
    let calendarRow;
    let requestStartDate;
    let requestEndDate;
    let iDate;
    let pCustomerName, hiddenCareRequestId;
    let calendarDayHeader;
    let dateIsUnavailable;
    
    for (let rowNum = 0; rowNum < 6; rowNum++) {
        calendarRow = document.createElement('tr');
        for (let cellNum = 0; cellNum < 7; cellNum++) {
            calendarDay = document.createElement('td');
            calendarDay.classList.add('calendarDay');

            if (rowNum === 0 && cellNum < firstDayOfMonth) {
                calendarRow.appendChild(calendarDay);
            }
            else if (dayOfMonth > daysInMonth) {
                break;
            }
            else {
                iDate = new Date(selectedYear, selectedMonth, dayOfMonth);

               
                calendarDayHeaderContainer = document.createElement('div');
                calendarDayHeaderContainer.classList.add('calendarDayHeaderContainer');
                calendarDayHeader = document.createElement('div');
                calendarDayHeader.innerHTML = dayOfMonth;

                dateIsUnavailable = document.createElement('input');
                dateIsUnavailable.type = 'checkbox';
                dateIsUnavailable.title = 'Toggle availability for this date.';
                if (businessUnavailableDates.find(item => item.UnavailableDate.valueOf() === iDate.valueOf()) !== undefined) {
                    dateIsUnavailable.checked = true;
                }
                dateIsUnavailable.onchange = function () { toggleAvailability(this); }

                if(iDate >= todaysDate) {
                    calendarDayHeader.onclick = function () {
                        try {
                            let startDate = new Date(selectYear.value, parseInt(selectMonth.value) - 1, this.innerHTML);
                            appendCareRequestForm(function () { displayCareRequestForm(undefined, startDate); })
                        }
                        catch (e) {
                            displayError('Error displaying Care Calendar Request Form - ' + e.message);
                        }
                    }
                }
                if (iDate.getDate() === todaysDate.getDate()) {
                    calendarDay.classList.add('selected');
                }
                else if (iDate < todaysDate) {
                    calendarDay.classList.add('unavailableCalendarDay');
                    calendarDayHeader.classList.add('unavailableCalendarDay');
                }


                calendarDayHeaderContainer.appendChild(dateIsUnavailable);
                calendarDayHeaderContainer.appendChild(calendarDayHeader);
                calendarDay.appendChild(calendarDayHeaderContainer);
                
                for (careRequest of careRequests) {
                    requestStartDate = new Date(careRequest.StartDate);
                    requestEndDate = new Date(careRequest.EndDate);
                    if (iDate >= requestStartDate && iDate <= requestEndDate) {
                        pCustomerName = document.createElement('p');
                        pCustomerName.classList.add('calendarEntry');
                        pCustomerName.innerHTML = careRequest.Customer.Name;
                        hiddenCareRequestId = document.createElement('input');
                        hiddenCareRequestId.type = 'hidden';
                        hiddenCareRequestId.name = 'CareRequestId';
                        hiddenCareRequestId.value = careRequest.ID;
                        pCustomerName.appendChild(hiddenCareRequestId);
                        pCustomerName.onclick = function () {
                            let careRequestID = this.querySelector('input[name="CareRequestId"]').value;
                            appendCareRequestForm(function () { displayCareRequestForm(careRequestID, undefined) });
                        }
                        calendarDay.appendChild(pCustomerName);
                    }
                }                
                calendarRow.appendChild(calendarDay);
                dayOfMonth++;
            }
        }
        calendarBody.appendChild(calendarRow); // appending each row into calendar body.
    }
}
function appendCareRequestForm(callBackFunction) {
    let xhttp = new XMLHttpRequest();
    xhttp.open('GET', 'Views/careRequest.html', true);
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            document.querySelector('#FormContainer').innerHTML = this.responseText;
            callBackFunction();
        }
    }
    xhttp.send();  
}
function getBusinessUnavailableDates() {
    let xhttp = new XMLHttpRequest();
    xhttp.open('GET', 'api/businessUnavailableDate?businessID=' + selectBusiness.value, true);
    xhttp.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4) {
            if (this.status === 200) {
                businessUnavailableDates = JSON.parse(this.responseText);
                for (businessUnavailableDate of businessUnavailableDates) { //Convert to Date object
                    businessUnavailableDate.UnavailableDate = new Date(businessUnavailableDate.UnavailableDate);
                }
            }
            else {
                displayError('Error getting Care Requests', this);
            }
        }
    };
    xhttp.send();
    xhttp.onerror = function () {
        displayError('Error getting Care Requests - onerror event');
    };
}
function toggleAvailability(element) {
    let unavailableDate = {};
    unavailableDate.BusinessID = selectBusiness.value;
    unavailableDate.UnavailableDate = new Date(selectYear.value, parseInt(selectMonth.value) - 1, element.nextSibling.innerHTML);
    let xhttp = new XMLHttpRequest();
    xhttp.open("POST", "api/businessUnavailableDate/", true);
    xhttp.setRequestHeader('Content-Type', 'application/json;charset=UTF-8')
    xhttp.onreadystatechange = function () {
        if (this.readyState === 4) {
            if (this.status === 200 || this.status === 204) {
                if (element.checked) {
                    element.parentElement.classList.add('unavailableCalendarDay');
                } else {
                    element.parentElement.classList.remove('unavailableCalendarDay');
                }
                getBusinessUnavailableDates();
            }
            else {
                displayError('Error saving Care Visit', this);
            }
        }
    };
    xhttp.send(JSON.stringify(unavailableDate));
    xhttp.onerror = function () {
        displayError('Error saving Unavailable Date - onerror event');
    };
}






