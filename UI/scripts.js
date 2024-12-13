// scripts.js

document.addEventListener('DOMContentLoaded', function() {
    const navLinks = document.querySelectorAll('nav a');
    const windows = document.querySelectorAll('.window');

    navLinks.forEach(function(link) {
        link.addEventListener('click', function(event) {
            event.preventDefault();
            const targetId = this.getAttribute('data-target');

            // Скрыть все окна
            windows.forEach(function(window) {
                window.classList.add('hidden');
            });

            // Показать выбранное окно
            document.getElementById(targetId).classList.remove('hidden');
        });
    });

    // Массив объектов ObjInf
    const ObjInf = [
        {
            id: '1',
            description: 'Описание 1',
            createdAt: new Date('2023-10-01'),
            author: 'Автор 1',
            photoLink: 'photo1.jpg'
        },
        // Добавьте остальные объекты...
    ];

    // Класс для работы с ObjInf
    class ObjCollection {
        constructor(objs = []) {
            this._objs = [];
            this.addAll(objs);
        }

        _validateObj(obj) {
            if (!obj || typeof obj !== 'object') return false;
            if (typeof obj.id !== 'string' || !obj.id.trim()) return false;
            if (typeof obj.description !== 'string' || obj.description.length >= 200) return false;
            if (!(obj.createdAt instanceof Date) || isNaN(obj.createdAt)) return false;
            if (typeof obj.author !== 'string' || !obj.author.trim()) return false;
            if (obj.photoLink && typeof obj.photoLink !== 'string') return false;
            return true;
        }

        addAll(objs) {
            const invalidObjs = [];
            objs.forEach((obj) => {
                if (this._validateObj(obj)) {
                    this._objs.push(obj);
                } else {
                    invalidObjs.push(obj);
                }
            });
            return invalidObjs;
        }

        getObjs(skip = 0, top = 10, filterConfig) {
            let result = this._objs;

            if (filterConfig) {
                Object.keys(filterConfig).forEach((key) => {
                    result = result.filter((obj) => obj[key] === filterConfig[key]);
                });
            }

            result.sort((a, b) => a.id.localeCompare(b.id));

            return result.slice(skip, skip + top);
        }

        getObj(id) {
            return this._objs.find((obj) => obj.id === id);
        }

        addObj(obj) {
            if (this._validateObj(obj)) {
                this._objs.push(obj);
                return true;
            }
            return false;
        }

        editObj(id, obj) {
            const index = this._objs.findIndex((item) => item.id === id);
            if (index === -1) return false;

            const existingObj = this._objs[index];
            const updatedObj = { ...existingObj, ...obj };

            updatedObj.id = existingObj.id;
            updatedObj.author = existingObj.author;
            updatedObj.createdAt = existingObj.createdAt;

            if (this._validateObj(updatedObj)) {
                this._objs[index] = updatedObj;
                return true;
            }
            return false;
        }

        removeObj(id) {
            const index = this._objs.findIndex((item) => item.id === id);
            if (index !== -1) {
                this._objs.splice(index, 1);
                return true;
            }
            return false;
        }

        clear() {
            this._objs = [];
        }
    }

    const collection = new ObjCollection(ObjInf);

    // Авторизация администратора
    const adminLoginForm = document.getElementById('admin-login-form');
    if (adminLoginForm) {
        adminLoginForm.addEventListener('submit', function(event) {
            event.preventDefault();

            const login = document.getElementById('admin-login').value;
            const password = document.getElementById('admin-password').value;

            if (login === 'admin' && password === 'password') {
                document.getElementById('admin').classList.add('hidden');
                document.getElementById('admin-panel').classList.remove('hidden');
                loadAdminPanel();
            } else {
                alert('Неверный логин или пароль');
            }
        });
    }

    // Функция загрузки админ-панели
    function loadAdminPanel() {
        const objTableBody = document.getElementById('obj-table-body');
        renderTable();

        // Добавление обработчика для формы добавления
        const addObjForm = document.getElementById('add-obj-form');
        addObjForm.addEventListener('submit', function(event) {
            event.preventDefault();
            const newObj = {
                id: document.getElementById('new-id').value,
                description: document.getElementById('new-description').value,
                createdAt: new Date(),
                author: document.getElementById('new-author').value,
                photoLink: document.getElementById('new-photoLink').value
            };
            if (collection.addObj(newObj)) {
                renderTable();
                addObjForm.reset();
            } else {
                alert('Ошибка при добавлении объекта. Проверьте данные.');
            }
        });
    }

    // Функция отображения таблицы объектов
    function renderTable() {
        const objTableBody = document.getElementById('obj-table-body');
        objTableBody.innerHTML = '';
        const objs = collection.getObjs(0, collection._objs.length);
        objs.forEach((obj) => {
            const row = document.createElement('tr');

            const idCell = document.createElement('td');
            idCell.textContent = obj.id;
            row.appendChild(idCell);

            const descCell = document.createElement('td');
            descCell.textContent = obj.description;
            row.appendChild(descCell);

            const dateCell = document.createElement('td');
            dateCell.textContent = obj.createdAt.toLocaleDateString();
            row.appendChild(dateCell);

            const authorCell = document.createElement('td');
            authorCell.textContent = obj.author;
            row.appendChild(authorCell);

            const actionsCell = document.createElement('td');

            const editButton = document.createElement('button');
            editButton.textContent = 'Редактировать';
            editButton.addEventListener('click', function() {
                editObj(obj.id);
            });
            actionsCell.appendChild(editButton);

            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Удалить';
            deleteButton.addEventListener('click', function() {
                if (confirm('Точно удалить объект?')) {
                    collection.removeObj(obj.id);
                    renderTable();
                }
            });
            actionsCell.appendChild(deleteButton);

            row.appendChild(actionsCell);

            objTableBody.appendChild(row);
        });
    }

    // Функция редактирования объекта
    function editObj(id) {
        const obj = collection.getObj(id);
        if (!obj) return;

        const newDescription = prompt('Введите новое описание:', obj.description);
        if (newDescription !== null) {
            if (collection.editObj(id, { description: newDescription })) {
                renderTable();
            } else {
                alert('Ошибка при редактировании объекта.');
            }
        }
    }
});