﻿let localBusinesses = [];
let selectLocalBusiness;

function initVisitorView() {
    initCalendarControls();
    selectLocalBusiness = document.getElementById('SelectLocalBusiness');
    getLocalBusinesses(getBusinessUnavailableDates); //ToDo - figure out how to select local 
    
}
function getLocalBusinesses(callBackFuntion) {
    let xhttp = new XMLHttpRequest();
    xhttp.open('GET', 'api/business', true);
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status === 200) {
            localBusinesses = JSON.parse(this.responseText);
            loadSelectElement(selectLocalBusiness, localBusinesses, false);
            callBackFuntion(selectLocalBusiness.value, createVisitorCalendar);
        }
    };
    xhttp.send();
    xhttp.onerror = function () {
        displayError('getLocalBusinesses - onerror event');
    };
}
function createVisitorCalendar() {
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
    let iDate;
    let calendarDayHeaderContainer;
    let calendarDayHeader;

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
               
                if (iDate.valueOf() === todaysDate.valueOf()) {
                    calendarDay.classList.add('selected');
                }
                else if ((iDate < todaysDate) || (businessUnavailableDates.find(item => item.UnavailableDate.valueOf() === iDate.valueOf()) !== undefined)) {
                    calendarDay.classList.add('unavailableCalendarDay');
                    calendarDayHeader.classList.add('unavailableCalendarDay');
                }
                calendarDayHeaderContainer.appendChild(calendarDayHeader);
                calendarDay.appendChild(calendarDayHeaderContainer);
              
                calendarRow.appendChild(calendarDay);
                dayOfMonth++;
            }
        }
        calendarBody.appendChild(calendarRow); // appending each row into calendar body.
    }
}