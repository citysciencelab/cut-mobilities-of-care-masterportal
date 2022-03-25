CREATE TABLE person
(
    person_id integer NOT NULL GENERATED ALWAYS AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1 ),
    date_created timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    age character(10),
    gender character varying,
    marital_status character(2),
    employment_status character(2),
    household_income character(20),
    additional character varying,
    CONSTRAINT person_pkey PRIMARY KEY (person_id)
);

CREATE TABLE person_in_need
(
    person_in_need_id integer NOT NULL GENERATED ALWAYS AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1 ),
    name character varying,
    age character(10),
    person_in_need_class character(2),
    is_same_household boolean,
    person_id integer NOT NULL,
    CONSTRAINT person_in_need_pkey PRIMARY KEY (person_in_need_id),
    CONSTRAINT fk_person_person_in_need
      FOREIGN KEY(person_id) 
	    REFERENCES person(person_id)
        ON DELETE CASCADE
);

CREATE TABLE mobility_entry
(
    entry_id integer NOT NULL GENERATED ALWAYS AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1 ),
    date_created timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    description character varying,
    weekdays integer ARRAY[7],
    person_id integer NOT NULL,
    CONSTRAINT mobility_entry_pkey PRIMARY KEY (entry_id),
    CONSTRAINT fk_person_mobility_entry
      FOREIGN KEY(person_id) 
	    REFERENCES person(person_id)
        ON DELETE CASCADE
);

CREATE TABLE audio
(
    audio_id integer NOT NULL GENERATED ALWAYS AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1 ),
    audio_file character varying NOT NULL,
    entry_id integer NOT NULL,
    CONSTRAINT audio_pkey PRIMARY KEY (audio_id),
    CONSTRAINT fk_entry_id
      FOREIGN KEY(entry_id)
	    REFERENCES mobility_entry(entry_id)
        ON DELETE CASCADE
);

CREATE TABLE feature
(
    feature_id integer NOT NULL GENERATED ALWAYS AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1 ),
    title character varying,
    feature_geometry character varying NOT NULL,
    feature_type character(10),
    geometry_index integer NOT NULL,
    mobility_mode character varying,
    entry_id integer NOT NULL,
    CONSTRAINT feature_pkey PRIMARY KEY (feature_id),
    CONSTRAINT fk_mobility_entry
      FOREIGN KEY(entry_id) 
	    REFERENCES mobility_entry(entry_id)
        ON DELETE CASCADE
);

CREATE TABLE time_traveled
(
    time_traveled_id integer NOT NULL GENERATED ALWAYS AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1 ),
    start_time time,
    end_time time,
    feature_id integer NOT NULL,
    CONSTRAINT time_traveled_pkey PRIMARY KEY (time_traveled_id),
    CONSTRAINT time_traveled_feature_id_key UNIQUE (feature_id),
    CONSTRAINT fk_feature_id
      FOREIGN KEY(feature_id) 
	    REFERENCES feature(feature_id)
        ON DELETE CASCADE
);

CREATE TABLE comment
(
    commend_id integer NOT NULL GENERATED ALWAYS AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1 ),
    comment character varying NOT NULL,
    feature_id integer NOT NULL,
    CONSTRAINT comment_pkey PRIMARY KEY (commend_id),
    CONSTRAINT comment_feature_id_key UNIQUE (feature_id),
    CONSTRAINT fk_feature_id
      FOREIGN KEY(feature_id) 
	    REFERENCES feature(feature_id)
        ON DELETE CASCADE
);

CREATE TABLE cost
(
    cost_id integer NOT NULL GENERATED ALWAYS AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1 ),
    cost decimal NOT NULL,
    feature_id integer NOT NULL,
    CONSTRAINT cost_pkey PRIMARY KEY (cost_id),
    CONSTRAINT cost_feature_id_key UNIQUE (feature_id),
    CONSTRAINT fk_feature_id
      FOREIGN KEY(feature_id) 
	    REFERENCES feature(feature_id)
        ON DELETE CASCADE
);