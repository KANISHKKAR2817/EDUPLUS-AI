import sys
import os
from datetime import datetime, timedelta
import json

# Ensure backend directory is in path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.core.database import SessionLocal, Base, engine
from app.core.security import hash_password
from app.models.models import (
    User, StudentProfile, TeacherProfile, Course, CourseEnrollment,
    TeacherCourseAssignment, Concept, Assessment, Question,
    QuestionConcept, StudentAttempt, AttendanceRecord, Assignment,
    Submission, LearningMaterial, Intervention, RiskScoreSnapshot,
    AuditLog
)
from app.services.risk_scorer import calculate_student_risk

def seed_all_data():
    db = SessionLocal()
    try:
        print("Starting EduPulse synthetic data generation...")
        Base.metadata.drop_all(bind=engine)
        Base.metadata.create_all(bind=engine)

        default_pwd = hash_password("Password123!")

        # 1. Create Faculty & Admin Users
        admin_user = User(
            username="admin",
            email="admin@college.edu",
            hashed_password=default_pwd,
            full_name="System Administrator",
            role="admin",
            is_active=True
        )
        db.add(admin_user)

        teacher_kavitha = User(
            username="dr.kavitha",
            email="kavitha.cse@college.edu",
            hashed_password=default_pwd,
            full_name="Dr. Kavitha Raman",
            role="teacher",
            is_active=True
        )
        db.add(teacher_kavitha)

        teacher_ramesh = User(
            username="prof.ramesh",
            email="ramesh.cse@college.edu",
            hashed_password=default_pwd,
            full_name="Prof. Ramesh Sundaram",
            role="teacher",
            is_active=True
        )
        db.add(teacher_ramesh)
        db.flush()

        tp_kavitha = TeacherProfile(
            user_id=teacher_kavitha.id,
            employee_id="FAC-CSE-001",
            department="Computer Science & Engineering",
            designation="Professor & Academic Mentor"
        )
        tp_ramesh = TeacherProfile(
            user_id=teacher_ramesh.id,
            employee_id="FAC-CSE-004",
            department="Computer Science & Engineering",
            designation="Assistant Professor"
        )
        db.add_all([tp_kavitha, tp_ramesh])
        db.flush()

        # 2. Create Courses
        courses_data = [
            {"code": "CS201", "title": "Java Programming", "dept": "CSE", "credits": 4, "desc": "Object-oriented programming, data structures in Java, JVM memory model, and collections framework."},
            {"code": "CS202", "title": "Data Structures & Algorithms", "dept": "CSE", "credits": 4, "desc": "Linear and hierarchical data structures, sorting, asymptotic analysis, and graph traversals."},
            {"code": "CS203", "title": "Database Management Systems", "dept": "CSE", "credits": 3, "desc": "Relational algebra, SQL, normalization, concurrency control, and indexing strategies."},
            {"code": "MA201", "title": "Discrete Mathematics", "dept": "Mathematics", "credits": 4, "desc": "Combinatorics, graph theory, propositional logic, and recurrence relations."},
        ]

        course_objs = {}
        for c in courses_data:
            course = Course(
                code=c["code"],
                title=c["title"],
                department=c["dept"],
                credits=c["credits"],
                semester=4,
                description=c["desc"]
            )
            db.add(course)
            db.flush()
            course_objs[c["code"]] = course

        # Assign teachers to courses
        db.add(TeacherCourseAssignment(teacher_id=tp_kavitha.id, course_id=course_objs["CS201"].id))
        db.add(TeacherCourseAssignment(teacher_id=tp_kavitha.id, course_id=course_objs["CS202"].id))
        db.add(TeacherCourseAssignment(teacher_id=tp_ramesh.id, course_id=course_objs["CS203"].id))
        db.add(TeacherCourseAssignment(teacher_id=tp_ramesh.id, course_id=course_objs["MA201"].id))
        db.flush()

        # 3. Create Syllabus Concepts
        concepts_by_course = {
            "CS201": [
                ("Java Arrays & Indexing", "Single and multi-dimensional array memory allocation and iteration.", "Core", "beginner"),
                ("Conditions & Loops", "Control flow, nested loops, break, and continue logic.", "Core", "beginner"),
                ("Classes and Objects", "Encapsulation, constructors, reference variables, and garbage collection.", "OOP", "intermediate"),
                ("Inheritance & Polymorphism", "Method overriding, super keyword, and dynamic method dispatch.", "OOP", "intermediate"),
                ("Exception Handling", "Checked vs unchecked exceptions, try-catch-finally, and custom exceptions.", "Robustness", "advanced"),
            ],
            "CS202": [
                ("Linked Lists", "Singly, doubly, and circular linked list insertion, deletion, and traversal.", "Data Structure", "intermediate"),
                ("Stacks & Queues", "LIFO and FIFO mechanics, array and pointer implementations.", "Data Structure", "intermediate"),
                ("Binary Trees", "Tree traversals (in-order, pre-order, post-order) and binary search trees.", "Hierarchical", "advanced"),
                ("Sorting & Searching", "QuickSort, MergeSort, Binary Search time and space complexities.", "Algorithms", "intermediate"),
            ],
            "CS203": [
                ("Relational Normalization", "1NF, 2NF, 3NF, BCNF and functional dependency preservation.", "Theory", "advanced"),
                ("SQL Joins & Aggregates", "Inner, outer, cross joins, GROUP BY, and subqueries.", "Query Language", "intermediate"),
                ("Transactions & ACID", "Atomicity, Consistency, Isolation, Durability, and locking protocols.", "Engine", "advanced"),
            ],
            "MA201": [
                ("Propositional Logic", "Truth tables, logical equivalences, and formal proofs.", "Logic", "beginner"),
                ("Graph Theory Fundamentals", "Eulerian and Hamiltonian circuits, trees, and vertex coloring.", "Structures", "intermediate"),
            ]
        }

        concept_objs = {}
        for c_code, c_list in concepts_by_course.items():
            cid = course_objs[c_code].id
            for c_name, c_desc, c_cat, c_diff in c_list:
                conc = Concept(
                    course_id=cid,
                    name=c_name,
                    description=c_desc,
                    category=c_cat,
                    difficulty_level=c_diff
                )
                db.add(conc)
                db.flush()
                concept_objs[c_name] = conc

        # 4. Create Assessments and Mapped Questions
        # Java Assessments
        java_ut1 = Assessment(
            course_id=course_objs["CS201"].id,
            title="Unit Test 1: Foundations & Arrays",
            assessment_type="unit_test",
            max_marks=30.0,
            passing_marks=15.0,
            date_conducted=datetime.utcnow() - timedelta(days=28)
        )
        java_ut2 = Assessment(
            course_id=course_objs["CS201"].id,
            title="Unit Test 2: OOP & Methods",
            assessment_type="unit_test",
            max_marks=30.0,
            passing_marks=15.0,
            date_conducted=datetime.utcnow() - timedelta(days=14)
        )
        ds_mid = Assessment(
            course_id=course_objs["CS202"].id,
            title="Midterm Assessment: Data Structures",
            assessment_type="midterm",
            max_marks=50.0,
            passing_marks=25.0,
            date_conducted=datetime.utcnow() - timedelta(days=10)
        )
        db.add_all([java_ut1, java_ut2, ds_mid])
        db.flush()

        # Questions for Java UT1
        q1 = Question(
            assessment_id=java_ut1.id,
            question_text="What is the index of the last element in an array of size n in Java?",
            max_marks=10.0,
            question_type="mcq",
            options_json=json.dumps(["n", "n - 1", "n + 1", "0"]),
            correct_answer="n - 1",
            explanation="Array indexing in Java is 0-based; indices range from 0 to n-1."
        )
        q2 = Question(
            assessment_id=java_ut1.id,
            question_text="Which exception occurs when attempting to access index 5 in an array of size 5?",
            max_marks=10.0,
            question_type="mcq",
            options_json=json.dumps(["ArrayIndexOutOfBoundsException", "NullPointerException", "IllegalArgumentException", "IndexMismatchException"]),
            correct_answer="ArrayIndexOutOfBoundsException",
            explanation="Valid indices are 0 to 4. Index 5 causes an ArrayIndexOutOfBoundsException."
        )
        q3 = Question(
            assessment_id=java_ut1.id,
            question_text="How is memory allocated for an array declared with 'int[] arr = new int[10]'?",
            max_marks=10.0,
            question_type="mcq",
            options_json=json.dumps(["Contiguous heap allocation", "Fragmented stack memory", "Static code segment", "Non-contiguous blocks"]),
            correct_answer="Contiguous heap allocation",
            explanation="Java array objects and elements are allocated contiguously on the heap."
        )
        db.add_all([q1, q2, q3])
        db.flush()

        # Link questions to concepts
        db.add(QuestionConcept(question_id=q1.id, concept_id=concept_objs["Java Arrays & Indexing"].id))
        db.add(QuestionConcept(question_id=q2.id, concept_id=concept_objs["Java Arrays & Indexing"].id))
        db.add(QuestionConcept(question_id=q3.id, concept_id=concept_objs["Java Arrays & Indexing"].id))

        # Questions for Java UT2
        q4 = Question(
            assessment_id=java_ut2.id,
            question_text="What keyword is used to refer to the parent class constructor in Java?",
            max_marks=15.0,
            question_type="mcq",
            options_json=json.dumps(["this()", "super()", "parent()", "base()"]),
            correct_answer="super()",
            explanation="The super() call invokes the superclass constructor."
        )
        q5 = Question(
            assessment_id=java_ut2.id,
            question_text="Can a Java class inherit from more than one class directly?",
            max_marks=15.0,
            question_type="mcq",
            options_json=json.dumps(["Yes", "No, Java avoids diamond problem in classes", "Only if both are abstract", "Only in package-private mode"]),
            correct_answer="No, Java avoids diamond problem in classes",
            explanation="Java classes support single inheritance of state; multiple inheritance is enabled via interfaces."
        )
        db.add_all([q4, q5])
        db.flush()
        db.add(QuestionConcept(question_id=q4.id, concept_id=concept_objs["Inheritance & Polymorphism"].id))
        db.add(QuestionConcept(question_id=q5.id, concept_id=concept_objs["Inheritance & Polymorphism"].id))

        # Questions for Data Structures Midterm
        q6 = Question(
            assessment_id=ds_mid.id,
            question_text="What is the worst-case time complexity for inserting an element at the head of a Singly Linked List?",
            max_marks=25.0,
            question_type="mcq",
            options_json=json.dumps(["O(1)", "O(n)", "O(log n)", "O(n^2)"]),
            correct_answer="O(1)",
            explanation="Head insertion only requires creating a node and adjusting head pointer; O(1) constant time."
        )
        q7 = Question(
            assessment_id=ds_mid.id,
            question_text="Which traversal of a Binary Search Tree produces elements in ascending order?",
            max_marks=25.0,
            question_type="mcq",
            options_json=json.dumps(["Pre-order", "In-order", "Post-order", "Level-order"]),
            correct_answer="In-order",
            explanation="In-order traversal (Left, Root, Right) yields strictly non-decreasing sorted keys in a BST."
        )
        db.add_all([q6, q7])
        db.flush()
        db.add(QuestionConcept(question_id=q6.id, concept_id=concept_objs["Linked Lists"].id))
        db.add(QuestionConcept(question_id=q7.id, concept_id=concept_objs["Binary Trees"].id))
        db.flush()

        # 5. Create Assignments
        assign1 = Assignment(
            course_id=course_objs["CS201"].id,
            title="Lab Assignment 1: Array Manipulation & Matrix Operations",
            description="Implement matrix transpose, multiplication, and boundary element printing in Java.",
            instructions="Submit clean Java source files with comments and output screenshots.",
            max_marks=50.0,
            deadline=datetime.utcnow() - timedelta(days=20),
            concept_names_json=json.dumps(["Java Arrays & Indexing"])
        )
        assign2 = Assignment(
            course_id=course_objs["CS201"].id,
            title="Lab Assignment 2: Student Record Management System",
            description="Create an OOP hierarchy with Student and Instructor classes utilizing inheritance.",
            instructions="Implement encapsulation and proper exception handling for invalid marks.",
            max_marks=50.0,
            deadline=datetime.utcnow() - timedelta(days=5),
            concept_names_json=json.dumps(["Classes and Objects", "Inheritance & Polymorphism"])
        )
        assign3 = Assignment(
            course_id=course_objs["CS202"].id,
            title="Data Structures Lab 1: Doubly Linked List Implementation",
            description="Implement node insertion, deletion, and reverse display with rigorous pointer validation.",
            instructions="Submit Java/C++ implementation along with test case logs.",
            max_marks=50.0,
            deadline=datetime.utcnow() + timedelta(days=7),
            concept_names_json=json.dumps(["Linked Lists"])
        )
        db.add_all([assign1, assign2, assign3])
        db.flush()

        # 6. Create 35 Fictional Students with Plausible Profiles
        # Special Focus:
        # Student 1: Arun Kumar (Flagged Student - High Concern for demo scenario)
        # Student 2: Deepa Sundaram (High Achiever - Low Concern)
        # Student 3: Karthik Raja (Borderline - Moderate Concern)
        # Students 4-35: Cohort distribution covering all bands

        student_specs = [
            ("arun.kumar", "Arun Kumar", "22CS101", 6.2, "declining", 68.0, 32, [False, False, False, True, False]),
            ("deepa.s", "Deepa Sundaram", "22CS102", 9.4, "improving", 94.0, 38, [True, True, True, True, True]),
            ("karthik.r", "Karthik Raja", "22CS103", 7.1, "stable", 76.0, 31, [True, False, True, True, False]),
            ("ananya.m", "Ananya Menon", "22CS104", 8.8, "improving", 90.0, 36, [True, True, True, True, True]),
            ("vijay.s", "Vijay Sethupathi", "22CS105", 5.9, "declining", 64.0, 26, [False, False, False, False, True]),
            ("sneha.p", "Sneha Prakash", "22CS106", 8.2, "stable", 88.0, 35, [True, True, True, False, True]),
            ("rahul.d", "Rahul Dravid", "22CS107", 7.6, "stable", 80.0, 32, [True, True, False, True, True]),
            ("priya.n", "Priya Natarajan", "22CS108", 6.5, "declining", 70.0, 28, [False, True, False, True, False]),
            ("siddharth.m", "Siddharth Madhavan", "22CS109", 8.5, "improving", 92.0, 37, [True, True, True, True, True]),
            ("meera.j", "Meera Jasmine", "22CS110", 7.9, "stable", 84.0, 34, [True, True, True, False, True]),
            ("surya.k", "Surya Krishnamurthy", "22CS111", 6.8, "declining", 72.0, 29, [False, False, True, True, False]),
            ("harish.v", "Harish Varma", "22CS112", 5.4, "declining", 60.0, 24, [False, False, False, False, False]),
            ("divya.b", "Divya Bharathi", "22CS113", 8.9, "improving", 95.0, 38, [True, True, True, True, True]),
            ("arvind.s", "Arvind Swamy", "22CS114", 7.4, "stable", 79.0, 32, [True, True, False, True, False]),
            ("pooja.h", "Pooja Hegde", "22CS115", 8.1, "stable", 85.0, 34, [True, True, True, True, False]),
            ("manoj.b", "Manoj Bajpayee", "22CS116", 6.3, "declining", 67.0, 27, [False, True, False, False, True]),
            ("geetha.r", "Geetha Radhakrishnan", "22CS117", 9.1, "improving", 96.0, 39, [True, True, True, True, True]),
            ("naveen.p", "Naveen Polishetty", "22CS118", 7.3, "stable", 78.0, 31, [True, False, True, True, True]),
            ("keerthi.s", "Keerthi Suresh", "22CS119", 8.6, "improving", 91.0, 36, [True, True, True, True, True]),
            ("dhanush.k", "Dhanush Kasthuriraja", "22CS120", 6.9, "stable", 74.0, 30, [False, True, True, False, True]),
            ("aishwarya.r", "Aishwarya Rajesh", "22CS121", 8.4, "stable", 87.0, 35, [True, True, True, True, True]),
            ("kiran.k", "Kiran Kumar", "22CS122", 5.6, "declining", 62.0, 25, [False, False, False, True, False]),
            ("swathi.m", "Swathi Reddy", "22CS123", 7.7, "stable", 81.0, 33, [True, True, False, True, True]),
            ("vikram.k", "Vikram Kennedy", "22CS124", 9.2, "improving", 93.0, 37, [True, True, True, True, True]),
            ("bhavani.t", "Bhavani Shankar", "22CS125", 6.1, "declining", 66.0, 26, [False, False, True, False, False]),
            ("chaitanya.a", "Chaitanya Akkineni", "22CS126", 7.8, "stable", 82.0, 33, [True, True, True, True, False]),
            ("nithya.m", "Nithya Menen", "22CS127", 9.0, "improving", 94.0, 38, [True, True, True, True, True]),
            ("prashanth.t", "Prashanth Thyagarajan", "22CS128", 6.7, "declining", 71.0, 28, [False, True, False, True, False]),
            ("trisha.k", "Trisha Krishnan", "22CS129", 8.7, "stable", 89.0, 36, [True, True, True, True, True]),
            ("silambarasan.t", "Silambarasan Thesingu", "22CS130", 5.8, "declining", 63.0, 25, [False, False, False, False, True]),
            ("ramya.p", "Ramya Pandian", "22CS131", 7.5, "stable", 80.0, 32, [True, False, True, True, True]),
            ("gautham.m", "Gautham Menon", "22CS132", 8.3, "stable", 86.0, 34, [True, True, True, True, False]),
            ("anirudh.r", "Anirudh Ravichander", "22CS133", 7.2, "declining", 75.0, 30, [True, False, False, True, True]),
            ("aparath.b", "Aparna Balamurali", "22CS134", 9.3, "improving", 95.0, 38, [True, True, True, True, True]),
            ("santhanam.n", "Santhanam Neelamegam", "22CS135", 6.4, "stable", 73.0, 29, [False, True, False, True, False])
        ]

        student_profiles = []
        for uname, fname, roll, cgpa, trend, att_pct, att_classes, answers_bool in student_specs:
            u = User(
                username=uname,
                email=f"{uname}@college.edu",
                hashed_password=default_pwd,
                full_name=fname,
                role="student",
                is_active=True
            )
            db.add(u)
            db.flush()

            sp = StudentProfile(
                user_id=u.id,
                roll_number=roll,
                department="Computer Science & Engineering",
                semester=4,
                cgpa=cgpa,
                mentor_id=teacher_kavitha.id
            )
            db.add(sp)
            db.flush()
            student_profiles.append((sp, trend, att_pct, att_classes, answers_bool))

            # Enroll in all 4 courses
            for c_code, c_obj in course_objs.items():
                db.add(CourseEnrollment(student_id=sp.id, course_id=c_obj.id))

            # Attendance records across courses
            db.add(AttendanceRecord(
                student_id=sp.id,
                course_id=course_objs["CS201"].id,
                total_classes=40,
                classes_attended=att_classes,
                percentage=att_pct,
                recent_trend=trend,
                date_recorded=datetime.utcnow() - timedelta(days=2)
            ))
            db.add(AttendanceRecord(
                student_id=sp.id,
                course_id=course_objs["CS202"].id,
                total_classes=40,
                classes_attended=max(20, att_classes - 2),
                percentage=round(max(20, att_classes - 2) / 40.0 * 100.0, 1),
                recent_trend=trend,
                date_recorded=datetime.utcnow() - timedelta(days=2)
            ))

            # Student attempts on Java UT1 (Questions 1, 2, 3)
            q_list = [q1, q2, q3, q4, q5]
            for idx, q_curr in enumerate(q_list):
                is_c = answers_bool[idx] if idx < len(answers_bool) else False
                marks = q_curr.max_marks if is_c else 0.0
                db.add(StudentAttempt(
                    student_id=sp.id,
                    assessment_id=q_curr.assessment_id,
                    question_id=q_curr.id,
                    student_answer=q_curr.correct_answer if is_c else "Incorrect choice",
                    marks_obtained=marks,
                    is_correct=is_c,
                    timestamp=datetime.utcnow() - timedelta(days=14 + idx)
                ))

            # Submissions for assignments
            # Arun Kumar (index 0) has missed assignment 1 and submitted assignment 2 late!
            if roll == "22CS101":
                # Only submitted assignment 2 late
                db.add(Submission(
                    assignment_id=assign2.id,
                    student_id=sp.id,
                    submission_text="public class StudentHierarchy { /* Java inheritance assignment */ }",
                    submitted_at=datetime.utcnow() - timedelta(days=2),
                    is_late=True,
                    score=35.0,
                    teacher_feedback="Submitted 3 days late. Code structure is functional but lacks comments.",
                    ai_suggested_score=38.0,
                    ai_suggested_feedback="Working implementation with inheritance; edge cases need handling.",
                    is_approved=True,
                    graded_by=teacher_kavitha.id
                ))
            else:
                # Other students submit both
                db.add(Submission(
                    assignment_id=assign1.id,
                    student_id=sp.id,
                    submission_text="Matrix and Array implementation code.",
                    submitted_at=datetime.utcnow() - timedelta(days=22),
                    is_late=False,
                    score=45.0,
                    teacher_feedback="Well structured.",
                    is_approved=True,
                    graded_by=teacher_kavitha.id
                ))
                if att_pct > 70.0:
                    db.add(Submission(
                        assignment_id=assign2.id,
                        student_id=sp.id,
                        submission_text="Student record OOP hierarchy implementation.",
                        submitted_at=datetime.utcnow() - timedelta(days=6),
                        is_late=False,
                        score=48.0,
                        teacher_feedback="Excellent modular design.",
                        is_approved=True,
                        graded_by=teacher_kavitha.id
                    ))

        db.flush()

        # 7. Add Learning Materials with Extracted Summaries
        mat1 = LearningMaterial(
            course_id=course_objs["CS201"].id,
            title="Lecture Notes: Java Arrays, Memory Representation & Common Errors",
            file_type="pdf",
            extracted_text=(
                "Lecture 04: Java Arrays and Indexing Mechanisms.\n"
                "Arrays in Java are objects created on the heap. Indexing is strictly zero-based.\n"
                "When allocating 'int[] arr = new int[5]', the JVM allocates 5 contiguous integer slots.\n"
                "Accessing index 5 or negative integers immediately throws ArrayIndexOutOfBoundsException at runtime.\n"
                "To iterate safely without fencepost errors, always employ the pattern 'for (int i = 0; i < arr.length; i++)'."
            ),
            summary="Covers Java heap memory layout, zero-indexed boundary conditions, and techniques to prevent ArrayIndexOutOfBoundsException.",
            concepts_json=json.dumps(["Java Arrays & Indexing", "Conditions & Loops"]),
            flashcards_json=json.dumps([
                {"front": "Where are Java array elements allocated?", "back": "Contiguously on the Heap as an Array Object."},
                {"front": "What is the maximum valid index of array arr?", "back": "arr.length - 1."},
                {"front": "What exception occurs if index >= arr.length?", "back": "ArrayIndexOutOfBoundsException."}
            ]),
            practice_questions_json=json.dumps([
                {
                    "question": "What is the output of 'int[] a = new int[3]; System.out.println(a[3]);' in Java?",
                    "options": ["0", "null", "ArrayIndexOutOfBoundsException", "Compilation error"],
                    "answer": "ArrayIndexOutOfBoundsException"
                },
                {
                    "question": "How do you obtain the number of elements in a Java array?",
                    "options": ["arr.size()", "arr.length", "arr.length()", "arr.count()"],
                    "answer": "arr.length"
                }
            ]),
            uploaded_by=teacher_kavitha.id
        )

        mat2 = LearningMaterial(
            course_id=course_objs["CS202"].id,
            title="Module 02: Singly and Doubly Linked Lists",
            file_type="pdf",
            extracted_text=(
                "Module 02: Linked Lists.\n"
                "Linked lists provide dynamic memory allocation and O(1) head insertion.\n"
                "Each node holds a data item and a next reference pointer."
            ),
            summary="Fundamental mechanics of linked list structures, node pointers, and constant time head insertions.",
            concepts_json=json.dumps(["Linked Lists"]),
            flashcards_json=json.dumps([
                {"front": "What is the time complexity to insert at the head of a linked list?", "back": "O(1) constant time."},
                {"front": "Why is random access slow in linked lists?", "back": "Because memory is non-contiguous, requiring sequential traversal from head."}
            ]),
            practice_questions_json=json.dumps([
                {
                    "question": "What is the time complexity of searching an element in an unsorted linked list?",
                    "options": ["O(1)", "O(log n)", "O(n)", "O(n^2)"],
                    "answer": "O(n)"
                }
            ]),
            uploaded_by=teacher_kavitha.id
        )
        db.add_all([mat1, mat2])
        db.flush()

        # 8. Create Targeted Intervention for Arun Kumar (Demonstration Scenario)
        arun_sp = student_profiles[0][0]
        intv_arun = Intervention(
            student_id=arun_sp.id,
            concept_id=concept_objs["Java Arrays & Indexing"].id,
            course_id=course_objs["CS201"].id,
            title="Targeted Practice: Java Arrays & Memory Indexing",
            rationale="Arun scored 0/30 on Java Arrays in Unit Test 1 and missed continuous assessment lab 1.",
            evidence_summary="0 correct answers out of 3 attempts on concept 'Java Arrays & Indexing' (0.0% accuracy).",
            baseline_accuracy=0.0,
            follow_up_accuracy=None,
            status="assigned",
            outcome="pending",
            recommended_action="1. Review Lecture Notes on Java Arrays. 2. Solve 5 guided index tracing questions. 3. Complete follow-up verification quiz.",
            follow_up_task="Complete 5-question targeted follow-up quiz to verify boundary conditions and array allocation.",
            created_by=teacher_kavitha.id,
            created_at=datetime.utcnow() - timedelta(days=3),
            updated_at=datetime.utcnow() - timedelta(days=3)
        )
        db.add(intv_arun)
        db.flush()

        # 9. Calculate and persist initial risk snapshots for all 35 students
        print("Calculating transparent multi-signal risk snapshots for cohort...")
        for sp, trend, att_pct, att_classes, answers_bool in student_profiles:
            calculate_student_risk(sp, db, save_snapshot=True)

        # 10. Audit Log Initial Seed
        db.add(AuditLog(
            actor_id=admin_user.id,
            actor_role="admin",
            action="SYSTEM_INITIALIZED",
            target_type="System",
            details="EduPulse AI system seeded with 35 students, 4 courses, 14 concepts, and initial risk snapshots."
        ))

        db.commit()
        print("Database seeded successfully with all synthetic records!")

    except Exception as e:
        db.rollback()
        print(f"Error during seeding: {e}")
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    seed_all_data()
