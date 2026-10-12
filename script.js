


const N8N_WEBHOOK_URL = "https://study23.app.n8n.cloud/webhook/f16c437c-e941-4f52-88f9-75de35ef0f83";


const student = {
    name: "Manish Bhati",
    course: "B.Tech CSE",
    level: "Intermediate",
    skills: [
        "HTML",
        "CSS",
        "JavaScript",
        "Python",
        "Artificial Intelligence",
        "Prompt Engineering"
    ]
};


const courses = [
    {
        name: "Python for Data Science",
        category: "Data Science",
        level: "Beginner",
        duration: "8 Weeks",
        match: 96
    },

    {
        name: "Java Data Structures & Algorithms",
        category: "Programming",
        level: "Intermediate",
        duration: "10 Weeks",
        match: 92
    },

    {
        name: "Machine Learning Fundamentals",
        category: "Artificial Intelligence",
        level: "Intermediate",
        duration: "12 Weeks",
        match: 89
    },

    {
        name: "Full Stack Web Development",
        category: "Web Development",
        level: "Beginner",
        duration: "14 Weeks",
        match: 87
    }
];



function searchCourses(event) {

    if (event) {
        event.preventDefault();
    }

    const searchInput =
        document.getElementById("course-search");

    if (!searchInput) {
        return;
    }

    const searchText =
        searchInput.value.toLowerCase().trim();

    const courseCards =
        document.querySelectorAll(".course");

    courseCards.forEach(function (course) {

        const courseText =
            course.textContent.toLowerCase();

        if (courseText.includes(searchText)) {
            course.style.display = "block";
        } else {
            course.style.display = "none";
        }

    });
}

async function startCourse(courseName) {

    alert(
        "You selected: " +
        courseName
    );

    const activity = {

        student_name: student.name,

        student_course: student.course,

        course_name: courseName,

        activity: "course_started",

        timestamp: new Date().toISOString()

    };



    if (N8N_WEBHOOK_URL !== "") {

        try {

            const response = await fetch(
                N8N_WEBHOOK_URL,
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify(activity)
                }
            );


            if (!response.ok) {

                throw new Error(
                    "n8n request failed"
                );

            }


            const result =
                await response.json();

            console.log(
                "n8n response:",
                result
            );


        } catch (error) {

            console.error(
                "Error communicating with n8n:",
                error
            );

        }

    }


    /* ---------------------------------------------
       STORE ACTIVITY LOCALLY
    --------------------------------------------- */

    saveActivity(activity);

}


/* =====================================================
   SAVE ACTIVITY
===================================================== */

function saveActivity(activity) {

    let activities =
        JSON.parse(
            localStorage.getItem("learningActivities")
        ) || [];


    activities.push(activity);


    localStorage.setItem(
        "learningActivities",
        JSON.stringify(activities)
    );


    console.log(
        "Activity saved:",
        activity
    );
}


/* =====================================================
   TRACK COURSE VIEW
===================================================== */

function trackCourseView(courseName) {

    const activity = {

        student_name: student.name,

        course_name: courseName,

        activity: "course_view",

        timestamp: new Date().toISOString()

    };


    saveActivity(activity);

}


/* =====================================================
   PERSONALIZED RECOMMENDATION
===================================================== */

function generateRecommendations() {

    const sortedCourses =
        [...courses].sort(
            function (a, b) {
                return b.match - a.match;
            }
        );


    console.log(
        "Recommended courses:",
        sortedCourses
    );


    return sortedCourses;
}


/* =====================================================
   SHOW STUDENT INFORMATION
===================================================== */

function displayStudentInfo() {

    console.log(
        "Student:",
        student.name
    );

    console.log(
        "Course:",
        student.course
    );

    console.log(
        "Level:",
        student.level
    );

    console.log(
        "Skills:",
        student.skills
    );
}


/* =====================================================
   FEEDBACK FORM
===================================================== */

function submitFeedback(event) {

    event.preventDefault();


    const rating =
        document.getElementById(
            "course-rating"
        ).value;


    const feedback =
        document.getElementById(
            "feedback-message"
        ).value;


    if (!rating) {

        alert(
            "Please select a rating."
        );

        return;

    }


    const feedbackData = {

        student_name: student.name,

        rating: rating,

        feedback: feedback,

        timestamp: new Date().toISOString()

    };


    console.log(
        "Feedback:",
        feedbackData
    );


    /* Send feedback to n8n */

    if (N8N_WEBHOOK_URL !== "") {

        fetch(
            N8N_WEBHOOK_URL,
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body: JSON.stringify(
                    feedbackData
                )
            }
        )
        .then(
            response => response.json()
        )
        .then(
            data => {
                console.log(
                    "Feedback response:",
                    data
                );
            }
        )
        .catch(
            error => {
                console.error(
                    "Feedback error:",
                    error
                );
            }
        );

    }


    alert(
        "Thank you for your feedback!"
    );


    document.getElementById(
        "feedback-message"
    ).value = "";

}


/* =====================================================
   SEARCH FORM EVENT
===================================================== */

function setupSearch() {

    const searchForm =
        document.querySelector(
            "#dashboard form"
        );


    if (searchForm) {

        searchForm.addEventListener(
            "submit",
            searchCourses
        );

    }

}


/* =====================================================
   COURSE BUTTON EVENTS
===================================================== */

function setupCourseButtons() {

    const courseCards =
        document.querySelectorAll(
            ".course"
        );


    courseCards.forEach(
        function (card) {

            const button =
                card.querySelector(
                    "button"
                );


            if (!button) {
                return;
            }


            const heading =
                card.querySelector(
                    "h3"
                );


            if (!heading) {
                return;
            }


            const courseName =
                heading.textContent.trim();


            button.addEventListener(
                "click",
                function () {

                    startCourse(
                        courseName
                    );

                }
            );


            card.addEventListener(
                "click",
                function () {

                    trackCourseView(
                        courseName
                    );

                }
            );

        }
    );

}


/* =====================================================
   EXPLORE COURSE BUTTONS
===================================================== */

function setupExploreCourses() {

    const coursesTable =
        document.querySelector(
            "#courses table"
        );


    if (!coursesTable) {
        return;
    }


    const buttons =
        coursesTable.querySelectorAll(
            "button"
        );


    buttons.forEach(
        function (button, index) {

            button.addEventListener(
                "click",
                function () {

                    if (courses[index]) {

                        startCourse(
                            courses[index].name
                        );

                    }

                }
            );

        }
    );

}


/* =====================================================
   FEEDBACK EVENT
===================================================== */

function setupFeedback() {

    const feedbackForm =
        document.querySelector(
            "#feedback form"
        );


    if (feedbackForm) {

        feedbackForm.addEventListener(
            "submit",
            submitFeedback
        );

    }

}


/* =====================================================
   NAVIGATION
===================================================== */

function setupNavigation() {

    const links =
        document.querySelectorAll(
            "nav a"
        );


    links.forEach(
        function (link) {

            link.addEventListener(
                "click",
                function () {

                    console.log(
                        "Navigation:",
                        link.textContent
                    );

                }
            );

        }
    );

}


/* =====================================================
   PAGE LOAD
===================================================== */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        console.log(
            "EduRecommend started."
        );


        displayStudentInfo();


        generateRecommendations();


        setupSearch();


        setupCourseButtons();


        setupExploreCourses();


        setupFeedback();


        setupNavigation();

    }
);

