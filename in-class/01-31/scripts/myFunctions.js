function sumAB(A, B) {
    return A + B
}


function randomPosition() {
    return Math.random() * 140 + 70
}


// returns warning strings if val is not a positive number. Otherwise, returns the square root of val.
function returnsSq(val) {
    if (isNaN(val)) {
        return "Not a number!";
    } else if (val < 0) {
        return "Not a positive number."
    }
    else {
        return Math.sqrt(val);
    }
}



// Prints all who numbers starting from val and decreasing to 0, both ends inclusive.
// If not a whole number or less than zero, it prints error messages
function printWholeNumbersFrom(val) {
    if (isNaN(val)) {
        console.log(val + ": Not a number!")
    }
     else if ((val % 1) != 0) {
        console.log(val+ ": Not a whole number!")
    }
    else if (val <= 0) {
        console.log(val + ": Not greater than 0.")
    } else {
        for (let i = val; i >= 0; i--) {
            console.log(i);
        }
    }
}



