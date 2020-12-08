"use strict";

const logoutButton = new LogoutButton();
const ratesBoard = new RatesBoard();
const moneyManager = new MoneyManager();
const favoritesWidget = new FavoritesWidget();


// Выход из личного кабинета

logoutButton.action = function () {
	ApiConnector.logout(response => {
		if (response.success) {
			location.reload();
		}
	})
}


// Получение информации о пользователе

ApiConnector.current (response => {
	if (response.success) {
		ProfileWidget.showProfile(response.data);
	}
});


// Получение текущих курсов валюты

function getStocks() {
	ApiConnector.getStocks(response => {
		if (response.success) {
			ratesBoard.clearTable();
			ratesBoard.fillTable(response.data);
		}
	})
}

getStocks();
setInterval(getStocks, 60000);


// Операции с деньгами

let moneyTransactions = (apiRequest, operatedClass, message) => data => {
		apiRequest(data, response => {
		if (response.success) {
			ProfileWidget.showProfile(response.data);
			operatedClass.setMessage(response, message);
		} else {
			operatedClass.setMessage(!response, response.error);
		}
	})
}


moneyManager.addMoneyCallback = moneyTransactions(ApiConnector.addMoney, moneyManager, "Баланс успешно пополнен!");
moneyManager.conversionMoneyCallback = moneyTransactions(ApiConnector.convertMoney, moneyManager, "Конвертация успешно выполнена!");
moneyManager.sendMoneyCallback = moneyTransactions(ApiConnector.transferMoney, moneyManager, "Перевод успешно выполнен!");


// Работа с избранным

let favorites = () => {
	ApiConnector.getFavorites(response => {
	if (response.success) {
		favoritesWidget.clearTable();
		favoritesWidget.fillTable(response.data);
		moneyManager.updateUsersList(response.data);
	}
})
}

favorites();

let widget = (apiRequest, operatedClass, message) => data => {
	apiRequest(data, response => {
		if (response.success) {
			favorites();
			operatedClass.setMessage(response, message);
		} else {
			operatedClass.setMessage(!response, response.error);
		}
	})
}


favoritesWidget.addUserCallback = widget(ApiConnector.addUserToFavorites, favoritesWidget, "Пользователь успешно добавлен!");
favoritesWidget.removeUserCallback = widget(ApiConnector.removeUserFromFavorites, favoritesWidget, "Пользователь успешно удален!");
