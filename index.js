import inquirer from 'inquirer';
import mysql from 'mysql2';
import cTable from 'console.table';

const db = mysql.createConnection(
    {
        host: 'localhost',
        // MySQL username,
        user: 'root',
        // TODO: Add MySQL password
        password: '',
        database: 'planner_db'
    },
    console.log(`Connected to the planner_db database.`)
);

const initialQuestion = [
  {
    type: 'list',
    name: 'choice',
    message: 'What would you like to do?',
    choices: [
        'View All Departments',
        'View All Roles',
        'View All Employees',
        'Add Department',
        'Add Role',
        'Add Employee',
        'Update Employee Role',
        'Update Employee Manager',
        'View Employees by Manager',
        'View Employees by Department',
        'Delete a Department',
        'Delete a Role',
        'Delete an Employee',
    ]
  }
];

function ask() {
  inquirer.prompt(initialQuestion).then((answer) => {
    if (answer.choice === 'View All Departments') {
        console.log('View All Departments');
        return db.promise().query('SELECT * FROM departments').then(([rows, fields]) => {
            return rows;
        });
    } else if (answer.choice === 'View All Roles') {
        console.log('View All Roles');
        return db.promise().query('SELECT roles.title, roles.id, departments.name as department_name, roles.salary FROM roles LEFT JOIN departments ON roles.department_id = departments.id').then(([rows, fields]) => {
            return rows;
        });
    } else if (answer.choice === 'View All Employees') {
        console.log('View All Employees');
        return db.promise().query("SELECT employees.id, employees.first_name, employees.last_name, roles.title, departments.name as department_name, roles.salary, CONCAT(managers.first_name, ' ', managers.last_name) as manager FROM employees LEFT JOIN roles ON employees.role_id = roles.id LEFT JOIN departments ON roles.department_id = departments.id LEFT JOIN employees as managers ON employees.manager_id = managers.id").then(([rows, fields]) => {
            return rows;
        });
    } else if (answer.choice === 'Add Department') {
        console.log('Add Department');
        return inquirer.prompt([
            {
                type: 'input',
                name: 'name',
                message: 'What is the name of the department?'
            }
        ]).then((answer) => {
            const sql = 'INSERT INTO departments (name) VALUES (?)';
            const params = [answer.name];
            return db.promise().query(sql, params).then(([rows, fields]) => {
                return null;
            });
        });
    } else if (answer.choice === 'Add Role') {
        console.log('Add Role');
        return db.promise().query('SELECT * FROM departments').then(([rows, fields]) => {
            let departmentChoices = [];
            rows.forEach(row => {
                departmentChoices.push(row.name);
            });

            return inquirer.prompt([
                {
                    type: 'input',
                    name: 'name',
                    message: 'What is the name of the role?'
                },
                {
                    type: 'input',
                    name: 'salary',
                    message: 'What is the salary of the role?'
                },
                {
                    type: 'list',
                    name: 'department',
                    message: 'What department does the role belong to?',
                    choices: departmentChoices,
                }
            ]).then((answers) => {
                let departmentId;
                rows.forEach(row => {
                    if (row.name === answers.department) {
                        departmentId = row.id;
                    }
                });
                const sql = 'INSERT INTO roles (title, salary, department_id) VALUES (?, ?, ?)';
                const params = [answers.name, Number(answers.salary), departmentId];
                return db.promise().query(sql, params).then(([rows, fields]) => {
                    return null;
                });
            });
        });
    } else if (answer.choice === 'Add Employee') {
        console.log('Add Employee');
        let roleChoices = [];
        let roles = [];
        let managerChoices = ['None'];
        let managers = [];
        return db.promise().query('SELECT * FROM roles').then(([rows, fields]) => {
            roles = rows;
            roles.forEach(role => {
                roleChoices.push(role.title);
            });
            return db.promise().query('SELECT * FROM employees')
        }).then(([rows, fields]) => {
            rows.forEach(manager => {
                let fullName = manager.first_name + ' ' + manager.last_name;
                managers.push({
                    id: manager.id,
                    fullName: fullName
                })
                managerChoices.push(fullName);
            });

            return inquirer.prompt([
                {
                    type: 'input',
                    name: 'firstName',
                    message: "What is the employee's first name?"
                },
                {
                    type: 'input',
                    name: 'lastName',
                    message: "What is the employee's last name?"
                },
                {
                    type: 'list',
                    name: 'role',
                    message: "What is the employee's role?",
                    choices: roleChoices,
                },
                {
                    type: 'list',
                    name: 'manager',
                    message: "Who is the employee's manager?",
                    choices: managerChoices,
                }
            ]).then((answers) => {
                let roleId;
                let managerId = null;
                roles.forEach(role => {
                    if (role.title === answers.role) {
                        roleId = role.id;
                    }
                });
                managers.forEach(manager => {
                    if (manager.fullName === answers.manager) {
                        managerId = manager.id;
                    }
                });
                const sql = 'INSERT INTO employees (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)';
                const params = [answers.firstName, answers.lastName, roleId, managerId];
                return db.promise().query(sql, params).then(([rows, fields]) => {
                    return null;
                });
            });
        });
    } else if (answer.choice === 'Update Employee Role') {
        let roleChoices = [];
        let roles = [];
        let employeeChoices = ['None'];
        let employees = [];
        return db.promise().query('SELECT * FROM roles').then(([rows, fields]) => {
            roles = rows;
            roles.forEach(role => {
                roleChoices.push(role.title);
            });
            return db.promise().query('SELECT * FROM employees')
        }).then(([rows, fields]) => {
            rows.forEach(employee => {
                let fullName = employee.first_name + ' ' + employee.last_name;
                employees.push({
                    id: employee.id,
                    fullName: fullName
                })
                employeeChoices.push(fullName);
            });

            return inquirer.prompt([
                {
                    type: 'list',
                    name: 'employee',
                    message: "Which employee's role do you want to update?",
                    choices: employeeChoices,
                },
                {
                    type: 'list',
                    name: 'role',
                    message: "What is the employee's role?",
                    choices: roleChoices,
                },
            ]).then((answers) => {
                let roleId;
                let employeeId;
                roles.forEach(role => {
                    if (role.title === answers.role) {
                        roleId = role.id;
                    }
                });
                employees.forEach(employee => {
                    if (employee.fullName === answers.employee) {
                        employeeId = employee.id;
                    }
                });
                const sql = 'UPDATE employees SET role_id = ? WHERE id = ?';
                const params = [roleId, employeeId];
                return db.promise().query(sql, params).then(([rows, fields]) => {
                    return null;
                });
            });
        });
    } else if (answer.choice === 'Update Employee Manager') {
        let employeeChoices = [];
        let managerChoices = ['None'];
        let employees = [];
        return db.promise().query('SELECT * FROM employees').then(([rows, fields]) => {
            rows.forEach(employee => {
                let fullName = employee.first_name + ' ' + employee.last_name;
                employees.push({
                    id: employee.id,
                    fullName: fullName
                })
                employeeChoices.push(fullName);
                managerChoices.push(fullName);
            });
        }).then(() => {
            return inquirer.prompt([
                {
                    type: 'list',
                    name: 'employee',
                    message: "Which employee's manager do you want to update?",
                    choices: employeeChoices,
                },
                {
                    type: 'list',
                    name: 'manager',
                    message: "What is the employee's new manager?",
                    choices: managerChoices,
                },
            ]).then((answers) => {
                let managerId;
                let employeeId;
                employees.forEach(employee => {
                    if (employee.fullName === answers.employee) {
                        employeeId = employee.id;
                    } else if (employee.fullName === answers.manager) {
                        managerId = employee.id
                    }
                });
                const sql = 'UPDATE employees SET manager_id = ? WHERE id = ?';
                const params = [managerId, employeeId];
                return db.promise().query(sql, params).then(([rows, fields]) => {
                    return null;
                });
            });
        })
    } else if (answer.choice === 'View Employees by Manager') {
        let employeeChoices = [];
        let employees = [];
        return db.promise().query('SELECT * FROM employees').then(([rows, fields]) => {
            rows.forEach(employee => {
                let fullName = employee.first_name + ' ' + employee.last_name;
                employees.push({
                    id: employee.id,
                    fullName: fullName
                })
                employeeChoices.push(fullName);
            });
        }).then(() => {
            return inquirer.prompt([
                {
                    type: 'list',
                    name: 'manager',
                    message: "Which manager's employees do you want to see?",
                    choices: employeeChoices,
                },
            ]).then((answers) => {
                let managerId;
                employees.forEach(employee => {
                    if (employee.fullName === answers.manager) {
                        managerId = employee.id
                    }
                });
                const sql = "SELECT employees.id, employees.first_name, employees.last_name, roles.title, departments.name as department_name, roles.salary, CONCAT(managers.first_name, ' ', managers.last_name) as manager FROM employees LEFT JOIN roles ON employees.role_id = roles.id LEFT JOIN departments ON roles.department_id = departments.id LEFT JOIN employees as managers ON employees.manager_id = managers.id WHERE employees.manager_id = ?";
                const params = [managerId];
                return db.promise().query(sql, params).then(([rows, fields]) => {
                    return rows;
                });
            });
        });
    } else if (answer.choice === 'View Employees by Department') {
        let departmentChoices = [];
        let departments = [];
        return db.promise().query('SELECT * FROM departments').then(([rows, fields]) => {
            departments = rows
            rows.forEach(row => {
                departmentChoices.push(row.name);
            });
        }).then(() => {
            return inquirer.prompt([
                {
                    type: 'list',
                    name: 'department',
                    message: "Which department's employees do you want to see?",
                    choices: departmentChoices,
                },
            ]).then((answers) => {
                let departmentId;
                departments.forEach(department => {
                    if (department.name === answers.department) {
                        departmentId = department.id
                    }
                });
                const sql = "SELECT employees.id, employees.first_name, employees.last_name, roles.title, departments.name as department_name, roles.salary, CONCAT(managers.first_name, ' ', managers.last_name) as manager FROM employees LEFT JOIN roles ON employees.role_id = roles.id LEFT JOIN departments ON roles.department_id = departments.id LEFT JOIN employees as managers ON employees.manager_id = managers.id WHERE roles.department_id = ?";
                const params = [departmentId];
                return db.promise().query(sql, params).then(([rows, fields]) => {
                    return rows;
                });
            });
        });
    } else if (answer.choice === 'Delete a Department') {
        let departmentChoices = [];
        return db.promise().query('SELECT * FROM departments').then(([rows, fields]) => {
            rows.forEach(row => {
                departmentChoices.push(row.name);
            });
        }).then(() => {
            return inquirer.prompt([
                {
                    type: 'list',
                    name: 'department',
                    message: "Which department do you want to delete?",
                    choices: departmentChoices,
                },
            ]).then((answers) => {
                const sql = "DELETE FROM departments WHERE name = ?";
                const params = [answers.department];
                return db.promise().query(sql, params).then(([rows, fields]) => {
                    return null;
                });
            });
        });
    } else if (answer.choice === 'Delete a Role') {
        let roleChoices = [];
        return db.promise().query('SELECT * FROM roles').then(([rows, fields]) => {
            rows.forEach(row => {
                roleChoices.push(row.title);
            });
        }).then(() => {
            return inquirer.prompt([
                {
                    type: 'list',
                    name: 'role',
                    message: "Which role do you want to delete?",
                    choices: roleChoices,
                },
            ]).then((answers) => {
                const sql = "DELETE FROM roles WHERE title = ?";
                const params = [answers.role];
                return db.promise().query(sql, params).then(([rows, fields]) => {
                    return null;
                });
            });
        });
    } else if (answer.choice === 'Delete an Employee') {
        let employeeChoices = [];
        let employees = [];
        return db.promise().query('SELECT * FROM employees').then(([rows, fields]) => {
            rows.forEach(employee => {
                let fullName = employee.first_name + ' ' + employee.last_name;
                employees.push({
                    id: employee.id,
                    fullName: fullName
                })
                employeeChoices.push(fullName);
            });
        }).then(() => {
            return inquirer.prompt([
                {
                    type: 'list',
                    name: 'employee',
                    message: "Which employee do you want to delete?",
                    choices: employeeChoices,
                },
            ]).then((answers) => {
                let employeeId;
                employees.forEach((employee) => {
                    if (employee.fullName === answers.employee) {
                        employeeId = employee.id;
                    }
                });
                const sql = "DELETE FROM employees WHERE id = ?";
                const params = [employeeId];
                return db.promise().query(sql, params).then(([rows, fields]) => {
                    return null;
                });
            });
        });
    }
  }).then(answers => {
    if (answers) {
        const table = cTable.getTable(answers);
        console.log(table);
    }
  }).catch(console.error).finally(() => {
    ask();
  });
}

function getDepartments() {
    
}

ask();