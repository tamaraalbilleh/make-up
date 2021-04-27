DROP TABLE IF EXISTS makeup;
CREATE TABLE makeup (
    id SERIAL PRIMARY KEY,
    name VARCHAR (500),
    price VARCHAR (500),
    image VARCHAR (500),
    description VARCHAR(500)
)
