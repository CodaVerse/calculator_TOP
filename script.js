let runningTally; // start it with the first growingString
let operator = ""; // +, -, x, etc. Variable to pass into the switch statement
let growingString = ""; // grows with each button press until an operator or equals is pressed
let growingNumber; // holds growingString as type "number"
let tallySubstring = ""; // to display the value as a substring and prevent LCD overflow
let lastButtonPressed; // conditional to start a new calculation or continue off the previous

const equalsSign = document.getElementById("equals");
equalsSign.addEventListener("click", equals, false); // evaluates the statement

const sign = document.getElementById("sign");
const percent = document.getElementById("percent");
const backSpaceButton = document.getElementById("backSpace");

const numbersButtons = document.getElementsByClassName("numbers-buttons");
for (var i = 0; i < numbersButtons.length; i++) {
  numbersButtons[i].addEventListener("click", createNumberString, false);
} // this will make the string get longer with each number (and .) press

const operatorButtons = document.getElementsByClassName("operatorButtons");
for (var i = 0; i < operatorButtons.length; i++) {
  operatorButtons[i].addEventListener("click", setOperator, false);
} // for +, -, *, /

sign.removeEventListener("click", setOperator); // since previous loop added an undesirable listener
sign.addEventListener("click", changeSign, false); // custom function for this one button

percent.removeEventListener("click", setOperator); // since loop added an undesirable listener
percent.addEventListener("click", calculatePercent, false); // custom function for this one button

backSpaceButton.removeEventListener("click", setOperator);
backSpaceButton.addEventListener("click", backSpace, false); // custom function to delete digits

const clearButton = document.getElementById("on-clear");
clearButton.addEventListener("click", clearLcd, false); // custom function to reset the calculation and LCD

function changeSign() {
  // used to make a number negative or positive
  if (lastButtonPressed === "calculate") {
    clearLcd();
  } else if (lastButtonPressed === "sign") {
    // if we have already assigned the number as negative, this will toggle it back to positive.
    growingNumber = growingNumber * -1;
    updateLcd(growingNumber);
  } else {
    growingNumber = parseFloat(growingString) * -1; // default as first pass to apply a number as negative
    updateLcd(growingNumber);
  }
  lastButtonPressed = "sign"; // tracks which button was pressed. There is probably an easier way to do this using event.value?
}

function createNumberString() {
  // generates a string we can manipulate prior to changing to a float(Number)
  if (lastButtonPressed == "calculate") {
    clearLcd(); // this sets the user up for a new equation if they have already hit equals
  }
  growingString += event.target.value; // string grows longer with the button value
  if (growingString === ".") {
    // allows for creation of decimal by prefacing it with '0.' - otherwise it shows up as NaN
    growingString = "0.";
  }
  if (growingString.length > 12) {
    // prevents the user from exceeding the LCD screen size
    alert("Whoa now, big guy... Try a smaller number.");
    growingString = "";
    clearLcd();
  } else {
    // if the string is a reasonable size, it is changed to a float number
    growingNumber = parseFloat(growingString);
    updateLcd(growingNumber);
  }
  lastButtonPressed = "number"; // tracks the last button pressed
}

function backSpace() {
  // for the delete button. This manipulates the string using slice()
  if (growingString == "") {
    return;
  }
  growingString = growingString.slice(0, growingString.length - 1);
  growingNumber = parseFloat(growingString);
  updateLcd(growingNumber);
  lastButtonPressed = "back";
}

function setOperator() {
  if (lastButtonPressed === "number" && runningTally != undefined) {
    // if user starts new equation immediately after 'equals'
    // this will allow the operator buttons to function like an equals if the user wants to chain calculations
    // on the back of a previous answer
    equals();
  }
  if (runningTally == undefined) {
    runningTally = growingNumber;
  }
  growingString = ""; // resets growingString to be created again, initially populated with the button value
  operator = event.target.value;
  updateLcd(operator); // shows the value of the operator (+, -, /, x)
  lastButtonPressed = "operator";
}

function updateLcd(display) {
  // shows the string in the LCD screen each time it;s called
  // Takes an argument so it is more versatile with the displayed value
  document.getElementById("lcd").textContent = display;
}

function clearLcd() {
  growingString = "";
  runningTally = null;
  updateLcd("0");
  lastButtonPressed = "clear";
}

function equals() {
  lastButtonPressed = "calculate";
  function returnReset() {
    // checks for faults then exists the function or displays the answer
    tallySubstring = runningTally.toString().substring(0, 13);
    if (runningTally > 9999999999 || runningTally < -9999999999) {
      // answer would exceed space
      clearLcd();
      updateLcd("Err too large");
    } else {
      updateLcd(tallySubstring);
      growingString = "";
      return runningTally;
    }
  }
  switch (operator) {
    case "+":
      runningTally += (growingNumber * 10) / 10; // need to multiply then divide to avoid floating point
      returnReset();
      break;
    case "-":
      runningTally -= (growingNumber * 10) / 10; // need to multiply then divide to avoid floating point
      returnReset();
      break;
    case "*":
      runningTally = (runningTally * growingNumber * 10) / 10; // need to multiply then divide to avoid floating point
      returnReset();
      break;
    case "÷":
      if (growingNumber == 0) {
        //  protects against divide by zero - exists the function
        clearLcd();
        updateLcd("Err div by 0");
        returnReset();
        break;
      } else {
        runningTally = ((runningTally / growingNumber) * 10) / 10;
        // if viable division probelm, still need to multiply then divide to avoid floating point
        returnReset();
        break;
      }
    default:
      console.log("Whoops. Continuing equation?");
  }
}

function calculatePercent() {
  // similar to equals
  lastButtonPressed = "calculate";
  function returnReset() {
    tallySubstring = runningTally.toString().substring(0, 13);
    if (runningTally > 9999999999) {
      clearLcd();
      updateLcd("Err");
    } else {
      updateLcd(tallySubstring);
      growingString = "";
      return runningTally;
    }
  }
  switch (operator) {
    case "+":
      runningTally =
        ((runningTally + (growingNumber / 100) * runningTally) * 10) / 10;
      // to add a percentage
      // need to multiply then divide to avoid floating point - similar ot equals
      returnReset();
      break;
    case "-":
      runningTally =
        ((runningTally - (growingNumber / 100) * runningTally) * 10) / 10;
      // to subtract a percentage
      returnReset();
      break;
    case "*":
      runningTally =
        (runningTally * ((growingNumber / 100) * runningTally) * 10) / 10;
      // to multiply a percentage
      returnReset();
      break;
    case "÷":
      runningTally =
        ((runningTally / ((growingNumber / 100) * runningTally)) * 10) / 10;
      // to divide a percentage
      returnReset();
      break;
    default:
      console.log("Whoops");
  }
}
