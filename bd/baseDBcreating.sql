USE web_portfolio_db;

CREATE TABLE users (
	user_id INT auto_increment PRIMARY KEY,
    nickname varchar(50) NOT NULL,
    email varchar(100) NOT NULL,
    password varchar(255) NOT NULL,
    name varchar(50),
    avatar_path varchar(255) DEFAULT NULL
);

CREATE table portfolio (
	portfolio_id INT auto_increment PRIMARY KEY,
    user_id INT NOT NULL,
    name varchar(50),
    description TEXT,
    avatar_path varchar(255) DEFAULT NULL,
    foreign key (user_id) references users(user_id)
);

CREATE table work(
	work_id INT auto_increment PRIMARY KEY,
    portfolio_id INT NOT NULL,
    work_name varchar(160) NOT NULL,
    description TEXT,
    link varchar(255),
    file_path varchar(255)
);

CREATE table contact(
	contact_id INT auto_increment PRIMARY KEY,
    portfolio_id INT NOT NULL,
    link varchar(255) NOT NULL,
    foreign key (portfolio_id) references portfolio(portfolio_id)
)
