let q, m, f, average, feedback;
const submit = document.getElementById("submit");
const reset = document.getElementById("reset");

submit.addEventListener("click", function form() {
    let name = document.getElementById("name").value;
    q = parseInt(document.getElementById("quiz").value);
    m = parseInt(document.getElementById("midterm").value);
    f = parseInt(document.getElementById("final").value);

    calculateFinalGrades(q, m, f);
    getFeedback(average);
    display(name, feedback);

    event.preventDefault();
});

function calculateFinalGrades(q, m, f) {
    average = (q * (20/100) + m * (30/100) + f * (50/100));
}

function getFeedback(average) {
    if (average > 90)
        feedback = "Excellent";
    if (average > 75 || average < 90)
        feedback = "Passing";
    if (average < 75)
        feedback = "Needs Improvement";
}

function display(name, feedback) {
    document.getElementById("result").innerHTML += "Name: " + name + "<br>\nAverage:" + average + "<br>\n" + feedback;
}