PGDMP                         }            urms_db    15.4    15.4 q    �           0    0    ENCODING    ENCODING        SET client_encoding = 'UTF8';
                      false            �           0    0 
   STDSTRINGS 
   STDSTRINGS     (   SET standard_conforming_strings = 'on';
                      false            �           0    0 
   SEARCHPATH 
   SEARCHPATH     8   SELECT pg_catalog.set_config('search_path', '', false);
                      false            �           1262    25535    urms_db    DATABASE     �   CREATE DATABASE urms_db WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = libc LOCALE = 'English_United States.1252';
    DROP DATABASE urms_db;
                postgres    false            �            1255    25794     before_insert_admission_status()    FUNCTION       CREATE FUNCTION public.before_insert_admission_status() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.admission_status_id := generate_id('adm', (SELECT COALESCE(MAX(SUBSTRING(admission_status_id, 4)::INT), 0) + 1 FROM AdmissionStatus));
    RETURN NEW;
END;
$$;
 7   DROP FUNCTION public.before_insert_admission_status();
       public          postgres    false            �            1255    25796    before_insert_courses()    FUNCTION     �   CREATE FUNCTION public.before_insert_courses() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.course_id := generate_id('crs', (SELECT COALESCE(MAX(SUBSTRING(course_id, 4)::INT), 0) + 1 FROM Courses));
    RETURN NEW;
END;
$$;
 .   DROP FUNCTION public.before_insert_courses();
       public          postgres    false            �            1255    25776    before_insert_departments()    FUNCTION        CREATE FUNCTION public.before_insert_departments() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.department_id := generate_id('dep', (SELECT COALESCE(MAX(SUBSTRING(department_id, 4)::INT), 0) + 1 FROM Departments));
    RETURN NEW;
END;
$$;
 2   DROP FUNCTION public.before_insert_departments();
       public          postgres    false            �            1255    25774    before_insert_faculties()    FUNCTION     �   CREATE FUNCTION public.before_insert_faculties() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.faculty_id := generate_id('fac', (SELECT COALESCE(MAX(SUBSTRING(faculty_id, 4)::INT), 0) + 1 FROM Faculties));
    RETURN NEW;
END;
$$;
 0   DROP FUNCTION public.before_insert_faculties();
       public          postgres    false            �            1255    25792    before_insert_lecturers()    FUNCTION     �   CREATE FUNCTION public.before_insert_lecturers() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.lecturer_id := generate_id('lec', (SELECT COALESCE(MAX(SUBSTRING(lecturer_id, 4)::INT), 0) + 1 FROM Lecturers));
    RETURN NEW;
END;
$$;
 0   DROP FUNCTION public.before_insert_lecturers();
       public          postgres    false            �            1255    25778    before_insert_levels()    FUNCTION     �   CREATE FUNCTION public.before_insert_levels() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.level_id := generate_id('lev', (SELECT COALESCE(MAX(SUBSTRING(level_id, 4)::INT), 0) + 1 FROM Levels));
    RETURN NEW;
END;
$$;
 -   DROP FUNCTION public.before_insert_levels();
       public          postgres    false            �            1255    25788 !   before_insert_pending_lecturers()    FUNCTION       CREATE FUNCTION public.before_insert_pending_lecturers() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.pending_lecturer_id := generate_id('plec', (SELECT COALESCE(MAX(SUBSTRING(pending_lecturer_id, 5)::INT), 0) + 1 FROM PendingLecturers));
    RETURN NEW;
END;
$$;
 8   DROP FUNCTION public.before_insert_pending_lecturers();
       public          postgres    false            �            1255    25786     before_insert_pending_students()    FUNCTION       CREATE FUNCTION public.before_insert_pending_students() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.pending_student_id := generate_id('pstu', (SELECT COALESCE(MAX(SUBSTRING(pending_student_id, 5)::INT), 0) + 1 FROM PendingStudents));
    RETURN NEW;
END;
$$;
 7   DROP FUNCTION public.before_insert_pending_students();
       public          postgres    false            �            1255    25798    before_insert_results()    FUNCTION     �   CREATE FUNCTION public.before_insert_results() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.result_id := generate_id('res', (SELECT COALESCE(MAX(SUBSTRING(result_id, 4)::INT), 0) + 1 FROM Results));
    RETURN NEW;
END;
$$;
 .   DROP FUNCTION public.before_insert_results();
       public          postgres    false            �            1255    25782    before_insert_semesters()    FUNCTION     �   CREATE FUNCTION public.before_insert_semesters() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.semester_id := generate_id('sem', (SELECT COALESCE(MAX(SUBSTRING(semester_id, 4)::INT), 0) + 1 FROM Semesters));
    RETURN NEW;
END;
$$;
 0   DROP FUNCTION public.before_insert_semesters();
       public          postgres    false            �            1255    25780    before_insert_sessions()    FUNCTION     �   CREATE FUNCTION public.before_insert_sessions() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.session_id := generate_id('ses', (SELECT COALESCE(MAX(SUBSTRING(session_id, 4)::INT), 0) + 1 FROM Sessions));
    RETURN NEW;
END;
$$;
 /   DROP FUNCTION public.before_insert_sessions();
       public          postgres    false            �            1255    25800    before_insert_student_courses()    FUNCTION       CREATE FUNCTION public.before_insert_student_courses() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.student_course_id := generate_id('sc', (SELECT COALESCE(MAX(SUBSTRING(student_course_id, 3)::INT), 0) + 1 FROM StudentCourses));
    RETURN NEW;
END;
$$;
 6   DROP FUNCTION public.before_insert_student_courses();
       public          postgres    false            �            1255    25802 %   before_insert_student_level_history()    FUNCTION     (  CREATE FUNCTION public.before_insert_student_level_history() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.student_level_history_id := generate_id('slh', (SELECT COALESCE(MAX(SUBSTRING(student_level_history_id, 4)::INT), 0) + 1 FROM StudentLevelHistory));
    RETURN NEW;
END;
$$;
 <   DROP FUNCTION public.before_insert_student_level_history();
       public          postgres    false            �            1255    25790    before_insert_students()    FUNCTION     �   CREATE FUNCTION public.before_insert_students() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.student_id := generate_id('stu', (SELECT COALESCE(MAX(SUBSTRING(student_id, 4)::INT), 0) + 1 FROM Students));
    RETURN NEW;
END;
$$;
 /   DROP FUNCTION public.before_insert_students();
       public          postgres    false            �            1255    25784    before_insert_users()    FUNCTION     �   CREATE FUNCTION public.before_insert_users() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.user_id := generate_id('usr', (SELECT COALESCE(MAX(SUBSTRING(user_id, 4)::INT), 0) + 1 FROM Users));
    RETURN NEW;
END;
$$;
 ,   DROP FUNCTION public.before_insert_users();
       public          postgres    false            �            1255    25536 '   generate_id(character varying, integer)    FUNCTION     �   CREATE FUNCTION public.generate_id(prefix character varying, sequence integer) RETURNS character varying
    LANGUAGE plpgsql
    AS $$
BEGIN
    RETURN prefix || LPAD(sequence::TEXT, 3, '0');
END;
$$;
 N   DROP FUNCTION public.generate_id(prefix character varying, sequence integer);
       public          postgres    false            �            1259    25659    admissionstatus    TABLE     �  CREATE TABLE public.admissionstatus (
    admission_status_id character varying(255) NOT NULL,
    status character varying(10) NOT NULL,
    rejection_reason text,
    date_updated timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_by character varying(255),
    pending_student_id character varying(255),
    pending_lecturer_id character varying(255),
    assigned_matric_number character varying(255),
    processed_by_user_id character varying(255)
);
 #   DROP TABLE public.admissionstatus;
       public         heap    postgres    false            �            1259    25673    courses    TABLE     J  CREATE TABLE public.courses (
    course_id character varying(255) NOT NULL,
    course_code character varying(20) NOT NULL,
    course_title character varying(255) NOT NULL,
    credit_unit integer NOT NULL,
    level_id character varying(255),
    department_id character varying(255),
    lecturer_id character varying(255)
);
    DROP TABLE public.courses;
       public         heap    postgres    false            �            1259    25544    departments    TABLE     �   CREATE TABLE public.departments (
    department_id character varying(255) NOT NULL,
    department_name character varying(255) NOT NULL,
    faculty_id character varying(255)
);
    DROP TABLE public.departments;
       public         heap    postgres    false            �            1259    25537 	   faculties    TABLE     �   CREATE TABLE public.faculties (
    faculty_id character varying(255) NOT NULL,
    faculty_name character varying(255) NOT NULL
);
    DROP TABLE public.faculties;
       public         heap    postgres    false            �            1259    25638 	   lecturers    TABLE     0  CREATE TABLE public.lecturers (
    lecturer_id character varying(255) NOT NULL,
    user_id character varying(255),
    first_name character varying(255) NOT NULL,
    last_name character varying(255) NOT NULL,
    email character varying(255) NOT NULL,
    department_id character varying(255),
    date_of_employment date NOT NULL,
    staff_id character varying(255) NOT NULL,
    phone_number character varying(20) NOT NULL,
    address text NOT NULL,
    profile_picture character varying(255),
    date_of_birth date,
    gender character varying(7)
);
    DROP TABLE public.lecturers;
       public         heap    postgres    false            �            1259    25556    levels    TABLE     |   CREATE TABLE public.levels (
    level_id character varying(255) NOT NULL,
    level_name character varying(10) NOT NULL
);
    DROP TABLE public.levels;
       public         heap    postgres    false            �            1259    25601    pendinglecturers    TABLE     "  CREATE TABLE public.pendinglecturers (
    pending_lecturer_id character varying(255) NOT NULL,
    first_name character varying(255) NOT NULL,
    last_name character varying(255) NOT NULL,
    email character varying(255) NOT NULL,
    department_id character varying(255) NOT NULL,
    phone_number character varying(20) NOT NULL,
    address text NOT NULL,
    profile_picture character varying(255),
    date_registered timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    intended_password character varying(255) NOT NULL
);
 $   DROP TABLE public.pendinglecturers;
       public         heap    postgres    false            �            1259    25590    pendingstudents    TABLE     �  CREATE TABLE public.pendingstudents (
    pending_student_id character varying(255) NOT NULL,
    first_name character varying(255) NOT NULL,
    last_name character varying(255) NOT NULL,
    date_of_birth date NOT NULL,
    email character varying(255) NOT NULL,
    department_id character varying(255) NOT NULL,
    level_id character varying(255) NOT NULL,
    gender character varying(10) NOT NULL,
    phone_number character varying(20) NOT NULL,
    address text NOT NULL,
    state_of_origin character varying(255) NOT NULL,
    local_government_area character varying(255) NOT NULL,
    profile_picture character varying(255),
    date_registered timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    intended_password character varying(255) NOT NULL,
    CONSTRAINT pendingstudents_gender_check CHECK (((gender)::text = ANY ((ARRAY['Male'::character varying, 'Female'::character varying, 'Other'::character varying])::text[])))
);
 #   DROP TABLE public.pendingstudents;
       public         heap    postgres    false            �            1259    25697    results    TABLE     �  CREATE TABLE public.results (
    result_id character varying(255) NOT NULL,
    student_id character varying(255),
    course_id character varying(255),
    semester_id character varying(255),
    score numeric(5,2) NOT NULL,
    grade character varying(2) NOT NULL,
    grade_point numeric(3,2) NOT NULL,
    session_id character varying(255),
    date_recorded timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
    DROP TABLE public.results;
       public         heap    postgres    false            �            1259    25566 	   semesters    TABLE     �   CREATE TABLE public.semesters (
    semester_id character varying(255) NOT NULL,
    semester_name character varying(20) NOT NULL,
    session_id character varying(255),
    is_current_semester boolean NOT NULL
);
    DROP TABLE public.semesters;
       public         heap    postgres    false            �            1259    25561    sessions    TABLE     �   CREATE TABLE public.sessions (
    session_id character varying(255) NOT NULL,
    session_name character varying(20) NOT NULL,
    is_current_session boolean NOT NULL
);
    DROP TABLE public.sessions;
       public         heap    postgres    false            �            1259    25725    studentcourses    TABLE     �   CREATE TABLE public.studentcourses (
    student_course_id character varying(255) NOT NULL,
    student_id character varying(255),
    course_id character varying(255),
    session_id character varying(255),
    semester_id character varying(255)
);
 "   DROP TABLE public.studentcourses;
       public         heap    postgres    false            �            1259    25752    studentlevelhistory    TABLE       CREATE TABLE public.studentlevelhistory (
    student_level_history_id character varying(255) NOT NULL,
    student_id character varying(255),
    level_id character varying(255),
    session_id character varying(255),
    start_date date NOT NULL,
    end_date date
);
 '   DROP TABLE public.studentlevelhistory;
       public         heap    postgres    false            �            1259    25611    students    TABLE     �  CREATE TABLE public.students (
    student_id character varying(255) NOT NULL,
    first_name character varying(255) NOT NULL,
    last_name character varying(255) NOT NULL,
    matriculation_number character varying(255) NOT NULL,
    date_of_birth date NOT NULL,
    email character varying(255) NOT NULL,
    department_id character varying(255),
    level_id character varying(255),
    date_of_admission date NOT NULL,
    gender character varying(10) NOT NULL,
    phone_number character varying(20) NOT NULL,
    address text NOT NULL,
    state_of_origin character varying(255) NOT NULL,
    local_government_area character varying(255) NOT NULL,
    profile_picture character varying(255),
    admission_status_id character varying(255),
    CONSTRAINT students_gender_check CHECK (((gender)::text = ANY ((ARRAY['Male'::character varying, 'Female'::character varying, 'Other'::character varying])::text[])))
);
    DROP TABLE public.students;
       public         heap    postgres    false            �            1259    25578    users    TABLE       CREATE TABLE public.users (
    user_id character varying(255) NOT NULL,
    username character varying(255) NOT NULL,
    password character varying(255) NOT NULL,
    role character varying(10) DEFAULT 'student'::character varying NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    student_id character varying(255),
    lecturer_id character varying(255),
    CONSTRAINT users_role_check CHECK (((role)::text = ANY ((ARRAY['student'::character varying, 'lecturer'::character varying, 'admin'::character varying])::text[])))
);
    DROP TABLE public.users;
       public         heap    postgres    false            �          0    25659    admissionstatus 
   TABLE DATA           �   COPY public.admissionstatus (admission_status_id, status, rejection_reason, date_updated, updated_by, pending_student_id, pending_lecturer_id, assigned_matric_number, processed_by_user_id) FROM stdin;
    public          postgres    false    224   ��       �          0    25673    courses 
   TABLE DATA           z   COPY public.courses (course_id, course_code, course_title, credit_unit, level_id, department_id, lecturer_id) FROM stdin;
    public          postgres    false    225   ��       �          0    25544    departments 
   TABLE DATA           Q   COPY public.departments (department_id, department_name, faculty_id) FROM stdin;
    public          postgres    false    215   �       �          0    25537 	   faculties 
   TABLE DATA           =   COPY public.faculties (faculty_id, faculty_name) FROM stdin;
    public          postgres    false    214   r�       �          0    25638 	   lecturers 
   TABLE DATA           �   COPY public.lecturers (lecturer_id, user_id, first_name, last_name, email, department_id, date_of_employment, staff_id, phone_number, address, profile_picture, date_of_birth, gender) FROM stdin;
    public          postgres    false    223   ��       �          0    25556    levels 
   TABLE DATA           6   COPY public.levels (level_id, level_name) FROM stdin;
    public          postgres    false    216   ӳ       �          0    25601    pendinglecturers 
   TABLE DATA           �   COPY public.pendinglecturers (pending_lecturer_id, first_name, last_name, email, department_id, phone_number, address, profile_picture, date_registered, intended_password) FROM stdin;
    public          postgres    false    221   �       �          0    25590    pendingstudents 
   TABLE DATA           �   COPY public.pendingstudents (pending_student_id, first_name, last_name, date_of_birth, email, department_id, level_id, gender, phone_number, address, state_of_origin, local_government_area, profile_picture, date_registered, intended_password) FROM stdin;
    public          postgres    false    220   Ӵ       �          0    25697    results 
   TABLE DATA           �   COPY public.results (result_id, student_id, course_id, semester_id, score, grade, grade_point, session_id, date_recorded) FROM stdin;
    public          postgres    false    226   o�       �          0    25566 	   semesters 
   TABLE DATA           `   COPY public.semesters (semester_id, semester_name, session_id, is_current_semester) FROM stdin;
    public          postgres    false    218   ��       �          0    25561    sessions 
   TABLE DATA           P   COPY public.sessions (session_id, session_name, is_current_session) FROM stdin;
    public          postgres    false    217   �       �          0    25725    studentcourses 
   TABLE DATA           k   COPY public.studentcourses (student_course_id, student_id, course_id, session_id, semester_id) FROM stdin;
    public          postgres    false    227   )�       �          0    25752    studentlevelhistory 
   TABLE DATA              COPY public.studentlevelhistory (student_level_history_id, student_id, level_id, session_id, start_date, end_date) FROM stdin;
    public          postgres    false    228   F�       �          0    25611    students 
   TABLE DATA           
  COPY public.students (student_id, first_name, last_name, matriculation_number, date_of_birth, email, department_id, level_id, date_of_admission, gender, phone_number, address, state_of_origin, local_government_area, profile_picture, admission_status_id) FROM stdin;
    public          postgres    false    222   c�       �          0    25578    users 
   TABLE DATA           f   COPY public.users (user_id, username, password, role, is_active, student_id, lecturer_id) FROM stdin;
    public          postgres    false    219   �       �           2606    25667 $   admissionstatus admissionstatus_pkey 
   CONSTRAINT     s   ALTER TABLE ONLY public.admissionstatus
    ADD CONSTRAINT admissionstatus_pkey PRIMARY KEY (admission_status_id);
 N   ALTER TABLE ONLY public.admissionstatus DROP CONSTRAINT admissionstatus_pkey;
       public            postgres    false    224            �           2606    25681    courses courses_course_code_key 
   CONSTRAINT     a   ALTER TABLE ONLY public.courses
    ADD CONSTRAINT courses_course_code_key UNIQUE (course_code);
 I   ALTER TABLE ONLY public.courses DROP CONSTRAINT courses_course_code_key;
       public            postgres    false    225            �           2606    25679    courses courses_pkey 
   CONSTRAINT     Y   ALTER TABLE ONLY public.courses
    ADD CONSTRAINT courses_pkey PRIMARY KEY (course_id);
 >   ALTER TABLE ONLY public.courses DROP CONSTRAINT courses_pkey;
       public            postgres    false    225            �           2606    25550    departments departments_pkey 
   CONSTRAINT     e   ALTER TABLE ONLY public.departments
    ADD CONSTRAINT departments_pkey PRIMARY KEY (department_id);
 F   ALTER TABLE ONLY public.departments DROP CONSTRAINT departments_pkey;
       public            postgres    false    215            �           2606    25543    faculties faculties_pkey 
   CONSTRAINT     ^   ALTER TABLE ONLY public.faculties
    ADD CONSTRAINT faculties_pkey PRIMARY KEY (faculty_id);
 B   ALTER TABLE ONLY public.faculties DROP CONSTRAINT faculties_pkey;
       public            postgres    false    214            �           2606    25646    lecturers lecturers_email_key 
   CONSTRAINT     Y   ALTER TABLE ONLY public.lecturers
    ADD CONSTRAINT lecturers_email_key UNIQUE (email);
 G   ALTER TABLE ONLY public.lecturers DROP CONSTRAINT lecturers_email_key;
       public            postgres    false    223            �           2606    25644    lecturers lecturers_pkey 
   CONSTRAINT     _   ALTER TABLE ONLY public.lecturers
    ADD CONSTRAINT lecturers_pkey PRIMARY KEY (lecturer_id);
 B   ALTER TABLE ONLY public.lecturers DROP CONSTRAINT lecturers_pkey;
       public            postgres    false    223            �           2606    25648     lecturers lecturers_staff_id_key 
   CONSTRAINT     _   ALTER TABLE ONLY public.lecturers
    ADD CONSTRAINT lecturers_staff_id_key UNIQUE (staff_id);
 J   ALTER TABLE ONLY public.lecturers DROP CONSTRAINT lecturers_staff_id_key;
       public            postgres    false    223            �           2606    25560    levels levels_pkey 
   CONSTRAINT     V   ALTER TABLE ONLY public.levels
    ADD CONSTRAINT levels_pkey PRIMARY KEY (level_id);
 <   ALTER TABLE ONLY public.levels DROP CONSTRAINT levels_pkey;
       public            postgres    false    216            �           2606    25610 +   pendinglecturers pendinglecturers_email_key 
   CONSTRAINT     g   ALTER TABLE ONLY public.pendinglecturers
    ADD CONSTRAINT pendinglecturers_email_key UNIQUE (email);
 U   ALTER TABLE ONLY public.pendinglecturers DROP CONSTRAINT pendinglecturers_email_key;
       public            postgres    false    221            �           2606    25608 &   pendinglecturers pendinglecturers_pkey 
   CONSTRAINT     u   ALTER TABLE ONLY public.pendinglecturers
    ADD CONSTRAINT pendinglecturers_pkey PRIMARY KEY (pending_lecturer_id);
 P   ALTER TABLE ONLY public.pendinglecturers DROP CONSTRAINT pendinglecturers_pkey;
       public            postgres    false    221            �           2606    25600 )   pendingstudents pendingstudents_email_key 
   CONSTRAINT     e   ALTER TABLE ONLY public.pendingstudents
    ADD CONSTRAINT pendingstudents_email_key UNIQUE (email);
 S   ALTER TABLE ONLY public.pendingstudents DROP CONSTRAINT pendingstudents_email_key;
       public            postgres    false    220            �           2606    25598 $   pendingstudents pendingstudents_pkey 
   CONSTRAINT     r   ALTER TABLE ONLY public.pendingstudents
    ADD CONSTRAINT pendingstudents_pkey PRIMARY KEY (pending_student_id);
 N   ALTER TABLE ONLY public.pendingstudents DROP CONSTRAINT pendingstudents_pkey;
       public            postgres    false    220            �           2606    25704    results results_pkey 
   CONSTRAINT     Y   ALTER TABLE ONLY public.results
    ADD CONSTRAINT results_pkey PRIMARY KEY (result_id);
 >   ALTER TABLE ONLY public.results DROP CONSTRAINT results_pkey;
       public            postgres    false    226            �           2606    25572    semesters semesters_pkey 
   CONSTRAINT     _   ALTER TABLE ONLY public.semesters
    ADD CONSTRAINT semesters_pkey PRIMARY KEY (semester_id);
 B   ALTER TABLE ONLY public.semesters DROP CONSTRAINT semesters_pkey;
       public            postgres    false    218            �           2606    25565    sessions sessions_pkey 
   CONSTRAINT     \   ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (session_id);
 @   ALTER TABLE ONLY public.sessions DROP CONSTRAINT sessions_pkey;
       public            postgres    false    217            �           2606    25731 "   studentcourses studentcourses_pkey 
   CONSTRAINT     o   ALTER TABLE ONLY public.studentcourses
    ADD CONSTRAINT studentcourses_pkey PRIMARY KEY (student_course_id);
 L   ALTER TABLE ONLY public.studentcourses DROP CONSTRAINT studentcourses_pkey;
       public            postgres    false    227            �           2606    25758 ,   studentlevelhistory studentlevelhistory_pkey 
   CONSTRAINT     �   ALTER TABLE ONLY public.studentlevelhistory
    ADD CONSTRAINT studentlevelhistory_pkey PRIMARY KEY (student_level_history_id);
 V   ALTER TABLE ONLY public.studentlevelhistory DROP CONSTRAINT studentlevelhistory_pkey;
       public            postgres    false    228            �           2606    25622    students students_email_key 
   CONSTRAINT     W   ALTER TABLE ONLY public.students
    ADD CONSTRAINT students_email_key UNIQUE (email);
 E   ALTER TABLE ONLY public.students DROP CONSTRAINT students_email_key;
       public            postgres    false    222            �           2606    25620 *   students students_matriculation_number_key 
   CONSTRAINT     u   ALTER TABLE ONLY public.students
    ADD CONSTRAINT students_matriculation_number_key UNIQUE (matriculation_number);
 T   ALTER TABLE ONLY public.students DROP CONSTRAINT students_matriculation_number_key;
       public            postgres    false    222            �           2606    25618    students students_pkey 
   CONSTRAINT     \   ALTER TABLE ONLY public.students
    ADD CONSTRAINT students_pkey PRIMARY KEY (student_id);
 @   ALTER TABLE ONLY public.students DROP CONSTRAINT students_pkey;
       public            postgres    false    222            �           2606    25587    users users_pkey 
   CONSTRAINT     S   ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (user_id);
 :   ALTER TABLE ONLY public.users DROP CONSTRAINT users_pkey;
       public            postgres    false    219            �           2606    25589    users users_username_key 
   CONSTRAINT     W   ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);
 B   ALTER TABLE ONLY public.users DROP CONSTRAINT users_username_key;
       public            postgres    false    219                       2620    25795 6   admissionstatus before_insert_admission_status_trigger    TRIGGER     �   CREATE TRIGGER before_insert_admission_status_trigger BEFORE INSERT ON public.admissionstatus FOR EACH ROW EXECUTE FUNCTION public.before_insert_admission_status();
 O   DROP TRIGGER before_insert_admission_status_trigger ON public.admissionstatus;
       public          postgres    false    224    240                       2620    25797 %   courses before_insert_courses_trigger    TRIGGER     �   CREATE TRIGGER before_insert_courses_trigger BEFORE INSERT ON public.courses FOR EACH ROW EXECUTE FUNCTION public.before_insert_courses();
 >   DROP TRIGGER before_insert_courses_trigger ON public.courses;
       public          postgres    false    225    241            �           2620    25777 -   departments before_insert_departments_trigger    TRIGGER     �   CREATE TRIGGER before_insert_departments_trigger BEFORE INSERT ON public.departments FOR EACH ROW EXECUTE FUNCTION public.before_insert_departments();
 F   DROP TRIGGER before_insert_departments_trigger ON public.departments;
       public          postgres    false    231    215            �           2620    25775 )   faculties before_insert_faculties_trigger    TRIGGER     �   CREATE TRIGGER before_insert_faculties_trigger BEFORE INSERT ON public.faculties FOR EACH ROW EXECUTE FUNCTION public.before_insert_faculties();
 B   DROP TRIGGER before_insert_faculties_trigger ON public.faculties;
       public          postgres    false    214    230                       2620    25793 )   lecturers before_insert_lecturers_trigger    TRIGGER     �   CREATE TRIGGER before_insert_lecturers_trigger BEFORE INSERT ON public.lecturers FOR EACH ROW EXECUTE FUNCTION public.before_insert_lecturers();
 B   DROP TRIGGER before_insert_lecturers_trigger ON public.lecturers;
       public          postgres    false    223    239            �           2620    25779 #   levels before_insert_levels_trigger    TRIGGER     �   CREATE TRIGGER before_insert_levels_trigger BEFORE INSERT ON public.levels FOR EACH ROW EXECUTE FUNCTION public.before_insert_levels();
 <   DROP TRIGGER before_insert_levels_trigger ON public.levels;
       public          postgres    false    216    232                       2620    25789 8   pendinglecturers before_insert_pending_lecturers_trigger    TRIGGER     �   CREATE TRIGGER before_insert_pending_lecturers_trigger BEFORE INSERT ON public.pendinglecturers FOR EACH ROW EXECUTE FUNCTION public.before_insert_pending_lecturers();
 Q   DROP TRIGGER before_insert_pending_lecturers_trigger ON public.pendinglecturers;
       public          postgres    false    221    237                       2620    25787 6   pendingstudents before_insert_pending_students_trigger    TRIGGER     �   CREATE TRIGGER before_insert_pending_students_trigger BEFORE INSERT ON public.pendingstudents FOR EACH ROW EXECUTE FUNCTION public.before_insert_pending_students();
 O   DROP TRIGGER before_insert_pending_students_trigger ON public.pendingstudents;
       public          postgres    false    236    220                       2620    25799 %   results before_insert_results_trigger    TRIGGER     �   CREATE TRIGGER before_insert_results_trigger BEFORE INSERT ON public.results FOR EACH ROW EXECUTE FUNCTION public.before_insert_results();
 >   DROP TRIGGER before_insert_results_trigger ON public.results;
       public          postgres    false    226    242                        2620    25783 )   semesters before_insert_semesters_trigger    TRIGGER     �   CREATE TRIGGER before_insert_semesters_trigger BEFORE INSERT ON public.semesters FOR EACH ROW EXECUTE FUNCTION public.before_insert_semesters();
 B   DROP TRIGGER before_insert_semesters_trigger ON public.semesters;
       public          postgres    false    218    234            �           2620    25781 '   sessions before_insert_sessions_trigger    TRIGGER     �   CREATE TRIGGER before_insert_sessions_trigger BEFORE INSERT ON public.sessions FOR EACH ROW EXECUTE FUNCTION public.before_insert_sessions();
 @   DROP TRIGGER before_insert_sessions_trigger ON public.sessions;
       public          postgres    false    217    233            	           2620    25801 4   studentcourses before_insert_student_courses_trigger    TRIGGER     �   CREATE TRIGGER before_insert_student_courses_trigger BEFORE INSERT ON public.studentcourses FOR EACH ROW EXECUTE FUNCTION public.before_insert_student_courses();
 M   DROP TRIGGER before_insert_student_courses_trigger ON public.studentcourses;
       public          postgres    false    227    243            
           2620    25803 ?   studentlevelhistory before_insert_student_level_history_trigger    TRIGGER     �   CREATE TRIGGER before_insert_student_level_history_trigger BEFORE INSERT ON public.studentlevelhistory FOR EACH ROW EXECUTE FUNCTION public.before_insert_student_level_history();
 X   DROP TRIGGER before_insert_student_level_history_trigger ON public.studentlevelhistory;
       public          postgres    false    244    228                       2620    25791 '   students before_insert_students_trigger    TRIGGER     �   CREATE TRIGGER before_insert_students_trigger BEFORE INSERT ON public.students FOR EACH ROW EXECUTE FUNCTION public.before_insert_students();
 @   DROP TRIGGER before_insert_students_trigger ON public.students;
       public          postgres    false    222    238                       2620    25785 !   users before_insert_users_trigger    TRIGGER     �   CREATE TRIGGER before_insert_users_trigger BEFORE INSERT ON public.users FOR EACH ROW EXECUTE FUNCTION public.before_insert_users();
 :   DROP TRIGGER before_insert_users_trigger ON public.users;
       public          postgres    false    219    235            �           2606    25687 "   courses courses_department_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.courses
    ADD CONSTRAINT courses_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.departments(department_id);
 L   ALTER TABLE ONLY public.courses DROP CONSTRAINT courses_department_id_fkey;
       public          postgres    false    215    225    3256            �           2606    25692     courses courses_lecturer_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.courses
    ADD CONSTRAINT courses_lecturer_id_fkey FOREIGN KEY (lecturer_id) REFERENCES public.lecturers(lecturer_id);
 J   ALTER TABLE ONLY public.courses DROP CONSTRAINT courses_lecturer_id_fkey;
       public          postgres    false    3284    225    223            �           2606    25682    courses courses_level_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.courses
    ADD CONSTRAINT courses_level_id_fkey FOREIGN KEY (level_id) REFERENCES public.levels(level_id);
 G   ALTER TABLE ONLY public.courses DROP CONSTRAINT courses_level_id_fkey;
       public          postgres    false    225    216    3258            �           2606    25551 '   departments departments_faculty_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.departments
    ADD CONSTRAINT departments_faculty_id_fkey FOREIGN KEY (faculty_id) REFERENCES public.faculties(faculty_id);
 Q   ALTER TABLE ONLY public.departments DROP CONSTRAINT departments_faculty_id_fkey;
       public          postgres    false    214    215    3254            �           2606    33456    students fk_admissionstatus    FK CONSTRAINT     �   ALTER TABLE ONLY public.students
    ADD CONSTRAINT fk_admissionstatus FOREIGN KEY (admission_status_id) REFERENCES public.admissionstatus(admission_status_id) ON DELETE SET NULL;
 E   ALTER TABLE ONLY public.students DROP CONSTRAINT fk_admissionstatus;
       public          postgres    false    224    222    3288            �           2606    33466 "   admissionstatus fk_pendinglecturer    FK CONSTRAINT     �   ALTER TABLE ONLY public.admissionstatus
    ADD CONSTRAINT fk_pendinglecturer FOREIGN KEY (pending_lecturer_id) REFERENCES public.pendinglecturers(pending_lecturer_id) ON DELETE SET NULL;
 L   ALTER TABLE ONLY public.admissionstatus DROP CONSTRAINT fk_pendinglecturer;
       public          postgres    false    224    3274    221            �           2606    33461 !   admissionstatus fk_pendingstudent    FK CONSTRAINT     �   ALTER TABLE ONLY public.admissionstatus
    ADD CONSTRAINT fk_pendingstudent FOREIGN KEY (pending_student_id) REFERENCES public.pendingstudents(pending_student_id) ON DELETE SET NULL;
 K   ALTER TABLE ONLY public.admissionstatus DROP CONSTRAINT fk_pendingstudent;
       public          postgres    false    220    224    3270            �           2606    33471    users fk_student    FK CONSTRAINT     �   ALTER TABLE ONLY public.users
    ADD CONSTRAINT fk_student FOREIGN KEY (student_id) REFERENCES public.students(student_id) ON DELETE SET NULL;
 :   ALTER TABLE ONLY public.users DROP CONSTRAINT fk_student;
       public          postgres    false    3280    222    219            �           2606    49840    users fk_users_lecturer    FK CONSTRAINT     �   ALTER TABLE ONLY public.users
    ADD CONSTRAINT fk_users_lecturer FOREIGN KEY (lecturer_id) REFERENCES public.lecturers(lecturer_id);
 A   ALTER TABLE ONLY public.users DROP CONSTRAINT fk_users_lecturer;
       public          postgres    false    223    3284    219            �           2606    25654 &   lecturers lecturers_department_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.lecturers
    ADD CONSTRAINT lecturers_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.departments(department_id);
 P   ALTER TABLE ONLY public.lecturers DROP CONSTRAINT lecturers_department_id_fkey;
       public          postgres    false    215    3256    223            �           2606    25649     lecturers lecturers_user_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.lecturers
    ADD CONSTRAINT lecturers_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id);
 J   ALTER TABLE ONLY public.lecturers DROP CONSTRAINT lecturers_user_id_fkey;
       public          postgres    false    223    219    3264            �           2606    25710    results results_course_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.results
    ADD CONSTRAINT results_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(course_id);
 H   ALTER TABLE ONLY public.results DROP CONSTRAINT results_course_id_fkey;
       public          postgres    false    226    3292    225            �           2606    25715     results results_semester_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.results
    ADD CONSTRAINT results_semester_id_fkey FOREIGN KEY (semester_id) REFERENCES public.semesters(semester_id);
 J   ALTER TABLE ONLY public.results DROP CONSTRAINT results_semester_id_fkey;
       public          postgres    false    218    3262    226            �           2606    25720    results results_session_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.results
    ADD CONSTRAINT results_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.sessions(session_id);
 I   ALTER TABLE ONLY public.results DROP CONSTRAINT results_session_id_fkey;
       public          postgres    false    3260    217    226            �           2606    25705    results results_student_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.results
    ADD CONSTRAINT results_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(student_id);
 I   ALTER TABLE ONLY public.results DROP CONSTRAINT results_student_id_fkey;
       public          postgres    false    226    222    3280            �           2606    25573 #   semesters semesters_session_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.semesters
    ADD CONSTRAINT semesters_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.sessions(session_id);
 M   ALTER TABLE ONLY public.semesters DROP CONSTRAINT semesters_session_id_fkey;
       public          postgres    false    3260    218    217            �           2606    25737 ,   studentcourses studentcourses_course_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.studentcourses
    ADD CONSTRAINT studentcourses_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(course_id);
 V   ALTER TABLE ONLY public.studentcourses DROP CONSTRAINT studentcourses_course_id_fkey;
       public          postgres    false    3292    225    227            �           2606    25747 .   studentcourses studentcourses_semester_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.studentcourses
    ADD CONSTRAINT studentcourses_semester_id_fkey FOREIGN KEY (semester_id) REFERENCES public.semesters(semester_id);
 X   ALTER TABLE ONLY public.studentcourses DROP CONSTRAINT studentcourses_semester_id_fkey;
       public          postgres    false    227    3262    218            �           2606    25742 -   studentcourses studentcourses_session_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.studentcourses
    ADD CONSTRAINT studentcourses_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.sessions(session_id);
 W   ALTER TABLE ONLY public.studentcourses DROP CONSTRAINT studentcourses_session_id_fkey;
       public          postgres    false    217    3260    227            �           2606    25732 -   studentcourses studentcourses_student_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.studentcourses
    ADD CONSTRAINT studentcourses_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(student_id);
 W   ALTER TABLE ONLY public.studentcourses DROP CONSTRAINT studentcourses_student_id_fkey;
       public          postgres    false    227    222    3280            �           2606    25764 5   studentlevelhistory studentlevelhistory_level_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.studentlevelhistory
    ADD CONSTRAINT studentlevelhistory_level_id_fkey FOREIGN KEY (level_id) REFERENCES public.levels(level_id);
 _   ALTER TABLE ONLY public.studentlevelhistory DROP CONSTRAINT studentlevelhistory_level_id_fkey;
       public          postgres    false    216    228    3258            �           2606    25769 7   studentlevelhistory studentlevelhistory_session_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.studentlevelhistory
    ADD CONSTRAINT studentlevelhistory_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.sessions(session_id);
 a   ALTER TABLE ONLY public.studentlevelhistory DROP CONSTRAINT studentlevelhistory_session_id_fkey;
       public          postgres    false    217    228    3260            �           2606    25759 7   studentlevelhistory studentlevelhistory_student_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.studentlevelhistory
    ADD CONSTRAINT studentlevelhistory_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(student_id);
 a   ALTER TABLE ONLY public.studentlevelhistory DROP CONSTRAINT studentlevelhistory_student_id_fkey;
       public          postgres    false    228    222    3280            �           2606    25628 $   students students_department_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.students
    ADD CONSTRAINT students_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.departments(department_id);
 N   ALTER TABLE ONLY public.students DROP CONSTRAINT students_department_id_fkey;
       public          postgres    false    3256    222    215            �           2606    25633    students students_level_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.students
    ADD CONSTRAINT students_level_id_fkey FOREIGN KEY (level_id) REFERENCES public.levels(level_id);
 I   ALTER TABLE ONLY public.students DROP CONSTRAINT students_level_id_fkey;
       public          postgres    false    222    216    3258            �   �   x��ҽj�0��~
�����u[2th�t�Hǒ��<%���kC�N?��i��fy<���}�}nH{���CvL�"��|��Jwn��vW �/'��+9� �8�������b�Y�^Z$Hp���4���;aP��#�X���#���ow=� (�<כJ��Sdm�|S��, sd�Ȼ������7x٩����W���eL��B�����Eg�#!�y���v�p�`&R��ۆ�m?m�      �   K  x�m�1O�0��˯�rl(�xu��%����ԭ�#���T
e���ݻ����-e-y-`���F�d��A������,9��2�X����C6��J���.�����pj�t�� ��8��"�H�dM�z�ax��']K �Xlz���^��&�%�ba�'��.��ry�-�z��[�(��Y%��.e���D�<�SL�M軂�]��0��3�ŮV�Z���L�׮g�6��	C覛��������}����O7W=\6((Ɋ�
���~+M]ñ�v�e���9���9#7����*�va1&�tm�u����apf��;?TU����      �   K   x�KI-000�t��-(-I-RN�L�KN�LKL�s����8�J�3�R��Sr3�2�K�K2�� ʌ�b���� �0i      �   4   x�KKL600�N�L�KN�Jq�8]��3�RS�2��!BƜ�E%�\1z\\\ ���      �      x������ � �      �   )   x��I-300�440��1�8�`LcNcӄ�Ȍ���� #�
�      �   �   x�eͽ�0@���}��B�tb`2�� ,��(�) ������'��@�
�١�
K���[K9=���;BK�=*�B�Q�$�Tg��MĎ�'@�*q�	����Q1OE�B��,�'�yެo��-���l������>痱�o1�E���nSK��5CaDf��kDKX��g�<�$ZF      �   �   x�E�M�0@����d:m)e��l�4D���o/�\��{{�Q�XR�V��8 $�����M��ƅ��yl<eG$��}7�.dl��@�x �|x��J���?����ɣ�t�;�m<�Z�54J�h}+�      �      x������ � �      �   I   x�+N�500�t�,*.QN�M-.I-�,N-��q���8�S���Rp�c�n�6��.o�U�1g	W� E\1�      �   4   x�+N-600�4202���i\� !#��!H�&d2	s�p��qqq �      �      x������ � �      �      x������ � �      �   �   x����0��˫TAG� �*1u�Y�͑Ih�U߾��'كe�ˊ�{Oae�}6<�����׺�˲.*%,b:K��������և��Թ�9z0�>o�ž�ɠ"�pR��Qy�u<�i�ѣ#v'hn@�c��&B� -e-�      �      x�U�͎�0�uy�B[�aX"APP��)J�:<�H�ɘ��MN�ss9� ���8@���0vk�|�{���>x�����cNę��x��J|�������Lk��@����3�U�9Jt7Փo��h���iH�Sї�X	s
�q�4���Kj��h�\�n5Us�r��I��l�u����$�\������!�j��1�������<{��n!��&�ӥ\G�_�5�����}k�A����/M{I�?8�cv     