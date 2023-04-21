const myHeading = document.querySelector("h1");
myHeading.textContent = "Hello world!";

/*
Everything in between is a comment.
*/

// This is a comment

function multiply(num1, num2) {
  let result = num1 * num2;
  return result;
}
document.querySelector("html").addEventListener("click", function () {
  alert("Ouch! Stop poking me!");
});
/* The function we just passed to addEventListener() 
here is called an anonymous function, because it doesn't 
have a name. 
There's an alternative way of writing anonymous functions, 
which we call an arrow function. An arrow function uses 
() => instead of function (): 

		document.querySelector("html").addEventListener("click", () => {
  		alert("Ouch! Stop poking me!");
        });