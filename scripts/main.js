const myImage = document.querySelector("img");

myImage.onclick = () => {
  const mySrc = myImage.getAttribute("src");
  if (mySrc === "images/charlotte-small-inverted.png") {
    myImage.setAttribute("src", "images/charlotte-small.png");
  } else {
    myImage.setAttribute("src", "images/charlotte-small-inverted.png");
  }
};

let myButton = document.querySelector("button");
let myHeading = document.querySelector("h1");


function setUserName() {
  const myName = prompt("Please enter your name.");
  if (!myName) {
    setUserName();
  } else {
    localStorage.setItem("name", myName);
    myHeading.textContent = `Whatup, ${myName}!`;
  }
}


if (!localStorage.getItem("name")) {
  setUserName();
} else {
  const storedName = localStorage.getItem("name");
  myHeading.textContent = `Whatup, ${storedName}!`;
}

myButton.onclick = () => {
  setUserName();
};

