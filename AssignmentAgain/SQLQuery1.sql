
CREATE TABLE location ( 
	id                   int NOT NULL   ,
	name                 varchar(100) NOT NULL   ,
	latitude             float NOT NULL   ,
	longitude            float NOT NULL   ,
	CONSTRAINT Pk_location_id PRIMARY KEY ( id )
 );

ALTER TABLE location ADD CONSTRAINT CK_Latitude CHECK ( latitude >= -90 AND latitude <= 90 );

ALTER TABLE location ADD CONSTRAINT CK_Longtitude CHECK ( longitude >= -180 AND longitude <= 180 );

CREATE TABLE reservation ( 
	id                   int NOT NULL   ,
	location_id          int NOT NULL   ,
	user_id              nvarchar(128) NOT NULL   ,
	CONSTRAINT Pk_reservation_id PRIMARY KEY ( id )
 );

CREATE INDEX Idx_reservation_location_id ON reservation ( location_id );

CREATE INDEX Idx_reservation_user_id ON reservation ( user_id );

CREATE TABLE route ( 
	id                   int NOT NULL   ,
	length               float NOT NULL   ,
	numOfLocation        int NOT NULL   ,
	CONSTRAINT Pk_route_id PRIMARY KEY ( id )
 );

ALTER TABLE route ADD CONSTRAINT CK_Length CHECK ( length > 0 );

ALTER TABLE route ADD CONSTRAINT CK_Number CHECK ( numOfLocation > 0 );

CREATE TABLE Point ( 
	id                   int NOT NULL   ,
	latitude             float NOT NULL   ,
	longitude            float NOT NULL   ,
	route_id             int NOT NULL   ,
	CONSTRAINT Pk_Point_id PRIMARY KEY ( id )
 );

CREATE INDEX Idx_Point_route_id ON Point ( route_id );

ALTER TABLE Point ADD CONSTRAINT fk_point_route FOREIGN KEY ( route_id ) REFERENCES route( id ) ON DELETE NO ACTION ON UPDATE NO ACTION;

ALTER TABLE reservation ADD CONSTRAINT fk_reservation_location FOREIGN KEY ( location_id ) REFERENCES location( id ) ON DELETE NO ACTION ON UPDATE NO ACTION;

ALTER TABLE reservation ADD CONSTRAINT fk_reservation_aspnetusers FOREIGN KEY ( user_id ) REFERENCES AspNetUsers( id ) ON DELETE NO ACTION ON UPDATE NO ACTION;
