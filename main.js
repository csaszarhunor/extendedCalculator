/**
 * Created by csasz on 6/1/2016.
 */
// Get all the keys from document
var keys = document.querySelectorAll('#calculator span');
var operators = ['+', '-', 'x', '÷'];
var decimalAdded = false;
var info = document.querySelector('#info');
var storage = localStorage;

// Add onclick event to all the keys and perform operations
for(var i = 0; i < keys.length; i++) {
    keys[i].onclick = function(e) {
        // Get the input and button values
        var input = document.querySelector('.screen');
        var inputVal = input.innerHTML;
        var btnVal = this.innerHTML;

        // Now, just append the key values (btnValue) to the input string and finally use javascript's eval function to get the result
        // If clear key is pressed, erase everything
        if(btnVal == 'C') {
            input.innerHTML = '';
            decimalAdded = false;
        }

        // If eval key is pressed, calculate and display the result
        else if(btnVal == '=') {
            var equation = inputVal;
            var lastChar = equation[equation.length - 1];

            // Replace all instances of x and ÷ with * and / respectively. This can be done easily using regex and the 'g' tag which will replace all instances of the matched character/substring
            equation = equation.replace(/x/g, '*').replace(/÷/g, '/');

            // Final thing left to do is checking the last character of the equation. If it's an operator or a decimal, remove it
            if(operators.indexOf(lastChar) > -1 || lastChar == '.')
                equation = equation.replace(/.$/, '');

            if(equation){
                var result = eval(equation);
                input.innerHTML = result;
                info.innerHTML = "loading...";
                displayInfo(info, result);
            }

            decimalAdded = false;
        }

        // Basic functionality of the calculator is complete. But there are some problems like
        // 1. No two operators should be added consecutively.
        // 2. The equation shouldn't start from an operator except minus
        // 3. not more than 1 decimal should be there in a number

        // We'll fix these issues using some simple checks

        // indexOf works only in IE9+
        else if(operators.indexOf(btnVal) > -1) {
            // Operator is clicked
            // Get the last character from the equation
            var lastChar = inputVal[inputVal.length - 1];

            // Only add operator if input is not empty and there is no operator at the last
            if(inputVal != '' && operators.indexOf(lastChar) == -1)
                input.innerHTML += btnVal;

            // Allow minus if the string is empty
            else if(inputVal == '' && btnVal == '-')
                input.innerHTML += btnVal;

            // Replace the last operator (if exists) with the newly pressed operator
            if(operators.indexOf(lastChar) > -1 && inputVal.length > 1) {
                // Here, '.' matches any character while $ denotes the end of string, so anything (will be an operator in this case) at the end of string will get replaced by new operator
                input.innerHTML = inputVal.replace(/.$/, btnVal);
            }

            decimalAdded =false;
        }

        // Now only the decimal problem is left. We can solve it easily using a flag 'decimalAdded' which we'll set once the decimal is added and prevent more decimals to be added once it's set. It will be reset when an operator, eval or clear key is pressed.
        else if(btnVal == '.') {
            if(!decimalAdded) {
                input.innerHTML += btnVal;
                decimalAdded = true;
            }
        }

        // if any other key is pressed, just append it
        else {
            input.innerHTML += btnVal;
        }

        // prevent page jumps
        e.preventDefault();
    }
}

var constructUrl = function(numberStr){
    var urlBase = "http://numbersapi.com/";
    for (var index in numberStr){
        if(numberStr.hasOwnProperty(index) && numberStr[index] != ".")
            urlBase += numberStr[index] + ",";
    }
    return urlBase.substr(0, urlBase.length - 1);
};

var displayFromServer = function(htmlElement, content){
    var numberStr = content.toString();
    var url = constructUrl(numberStr);
    var request = new XMLHttpRequest();
    request.onreadystatechange = onReady;
    request.open('GET', url, true);
    request.send();

    function onReady() {
        if (request.readyState == 4) {
            var response = request.responseText;

            // if the number was more than one digit long, numbersAPI returns a JSON object which needs further editing
            if (numberStr.length == 1){
                htmlElement.innerHTML = response;
                storage.setItem(numberStr, response);
            }
            else if (numberStr.length > 1){
                var JSONinfos = JSON.parse(response);
                var numberInfo = "";
                for (var info in JSONinfos){
                    if (JSONinfos.hasOwnProperty(info)){
                        numberInfo += JSONinfos[info] + " ";
                        storage.setItem(info, JSONinfos[info]);
                    }
                }
                htmlElement.innerHTML = numberInfo;
            }
        }
    }
};

var displayInfo = function(htmlElement, content){
    var numberStr = content.toString();
    var needHttpRequest = false;
    for (var i = 0; i < numberStr.length; i++){
        if (storage.getItem(numberStr[i]) === null)
            needHttpRequest = true;
    }
    if (needHttpRequest)
        displayFromServer(htmlElement, content);
    else {
        var numberInfo = "";
        for (var index in numberStr){
            numberInfo += storage.getItem(numberStr[index]);
        }
        htmlElement.innerHTML = numberInfo;
    }
};
