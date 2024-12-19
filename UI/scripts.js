document.addEventListener('DOMContentLoaded', function () {
    // Навигация
    const navLinks = document.querySelectorAll('nav a');
    const windows = document.querySelectorAll('.window');

    navLinks.forEach(function (link) {
        link.addEventListener('click', function (event) {
            event.preventDefault();
            const targetId = this.getAttribute('data-target');

            // Скрыть все окна
            windows.forEach(function (window) {
                window.classList.add('hidden');
            });

            // Показать выбранное окно
            document.getElementById(targetId).classList.remove('hidden');

        });
    });

    // Массив объектов
    const ObjInf = [
        {
            id: '1',
            description: 'Описание 1',
            createdAt: new Date('2023-10-01'),
            author: 'Автор 1',
            photoLink: 'photo1.jpg'
        },
        // Добавьте другие объекты сюда
    ];

    // Класс для работы с коллекцией объектов
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

            return result.slice(skip, skip + top);
        }


        addObj(obj) {
            if (this._validateObj(obj)) {
                this._objs.push(obj);
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

        save() {
            localStorage.setItem('ObjInf', JSON.stringify(this._objs));
        }

        restore() {
            const storedObjs = localStorage.getItem('ObjInf');
            if (storedObjs) {
                this._objs = JSON.parse(storedObjs);

                // Преобразуем строковые даты обратно в объекты Date
                this._objs.forEach((obj) => {
                    obj.createdAt = new Date(obj.createdAt); // Преобразуем строку в объект Date
                });
            }
        }

        sortById(order = 'asc') {
            const sortedObjs = this._objs.sort((a, b) => {
                // Если оба id числа, сравниваем их как числа
                if (typeof a.id === 'number' && typeof b.id === 'number') {
                    return a.id - b.id;
                }
                // Если оба id строки, сравниваем их как строки
                if (typeof a.id === 'string' && typeof b.id === 'string') {
                    return a.id.localeCompare(b.id, undefined, { numeric: true });
                }
                // Если типы id разные, строки считаются "больше" чисел
                if (typeof a.id === 'number') return -1; // Число "меньше", если сравнивается со строкой
                if (typeof b.id === 'number') return 1;  // Строка "больше", если сравнивается с числом
                return 0; // Если типы неизвестны, считаем равными
            });

            if (order === 'desc') {
                sortedObjs.reverse();
            }

            this._objs = sortedObjs;  // Обновляем объект коллекции
            this.save();  // Сохраняем отсортированные данные в localStorage

        }



        editObj(id, obj) {
            const index = this._objs.findIndex((item) => item.id === id);
            if (index === -1) return false;

            const existingObj = this._objs[index];
            const updatedObj = {...existingObj, ...obj};

            updatedObj.id = existingObj.id;
            updatedObj.author = existingObj.author;
            updatedObj.createdAt = existingObj.createdAt;

            if (this._validateObj(updatedObj)) {
                this._objs[index] = updatedObj;
                return true;
            }
            return false;
        }

        getObj(id) {
            return this._objs.find((obj) => obj.id === id);
        }
    }

    const collection = new ObjCollection();

    // Функция отображения таблицы объектов
    // Функция отображения таблицы объектов

// Переменные для пагинации
    let currentPage = 0; // Текущая страница
    const itemsPerPage = 10; // Количество элементов на страницу

// Функция отображения таблицы с учетом пагинации
    function renderTableWithPagination() {
        const objTableBody = document.getElementById('obj-table-body');
        objTableBody.innerHTML = ''; // Очищаем таблицу

        const objs = collection.getObjs(0, collection._objs.length); // Получаем все объекты

        const startIndex = currentPage * itemsPerPage; // Индекс начала текущей страницы
        const endIndex = startIndex + itemsPerPage;   // Индекс конца текущей страницы

        const paginatedObjs = objs.slice(startIndex, endIndex); // Элементы для текущей страницы

        // Проверяем, есть ли элементы для отображения
        if (paginatedObjs.length === 0) {
            const row = document.createElement('tr');
            const cell = document.createElement('td');
            cell.colSpan = 5;
            cell.textContent = 'Нет объектов для отображения';
            row.appendChild(cell);
            objTableBody.appendChild(row);
            return;
        }

        // Заполняем таблицу элементами текущей страницы
        paginatedObjs.forEach((obj) => {
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

            // Кнопка редактирования
            const editButton = document.createElement('button');
            editButton.textContent = 'Редактировать';
            editButton.addEventListener('click', function () {
                editObj(obj.id); // Открыть функцию редактирования
            });
            actionsCell.appendChild(editButton);

            // Кнопка удаления
            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Удалить';
            deleteButton.addEventListener('click', function () {
                if (confirm('Вы уверены, что хотите удалить этот объект?')) {
                    collection.removeObj(obj.id); // Удаление объекта из коллекции
                    collection.save();
                    renderTableWithPagination(); // Перерисовываем таблицу
                }
            });
            actionsCell.appendChild(deleteButton);

            row.appendChild(actionsCell);

            objTableBody.appendChild(row);
        });

        // Обновляем состояние кнопок пагинации
        updatePaginationButtons(objs.length);
    }

// Функция обновления состояния кнопок пагинации
    function updatePaginationButtons(totalItems) {
        const prevButton = document.getElementById('prev-page');
        const nextButton = document.getElementById('next-page');

        // Деактивируем кнопку "Предыдущая страница", если это первая страница
        prevButton.disabled = currentPage === 0;

        // Деактивируем кнопку "Следующая страница", если это последняя страница
        const totalPages = Math.ceil(totalItems / itemsPerPage);
        nextButton.disabled = currentPage >= totalPages - 1;
    }

// Обработчики для кнопок пагинации
    document.getElementById('prev-page').addEventListener('click', function () {
        if (currentPage > 0) {
            currentPage--; // Уменьшаем текущую страницу
            renderTableWithPagination();
        }
    });

    document.getElementById('next-page').addEventListener('click', function () {
        const totalItems = collection._objs.length;
        const totalPages = Math.ceil(totalItems / itemsPerPage);

        if (currentPage < totalPages - 1) {
            currentPage++; // Увеличиваем текущую страницу
            renderTableWithPagination();
        }
    });

// Первоначальный рендер таблицы с пагинацией
    renderTableWithPagination();


    collection.restore(); // Восстанавливаем данные из localStorage

    // Если localStorage пуст, заполняем данными из ObjInf
    if (collection._objs.length === 0) {
        collection.addAll(ObjInf);
        collection.save(); // Сохраняем в localStorage
    }
    // Функция редактирования объекта
    function editObj(id) {
        const obj = collection.getObj(id);
        if (!obj) return;

        const newDescription = prompt('Введите новое описание:', obj.description);
        if (newDescription !== null) {
            if (collection.editObj(id, {description: newDescription})) {
                collection.save(); // Сохраняем изменения после редактирования
                renderTableWithPagination();
            } else {
                alert('Ошибка при редактировании объекта.');
            }
        }
    }

    // Обработчик для добавления нового объекта
    const addObjForm = document.getElementById('add-obj-form');
    addObjForm.addEventListener('submit', function (event) {
        event.preventDefault();

        const newObj = {
            id: document.getElementById('new-id').value,
            description: document.getElementById('new-description').value,
            createdAt: new Date(),
            author: document.getElementById('new-author').value,
            photoLink: document.getElementById('new-photoLink').value
        };

        if (collection.addObj(newObj)) {
            renderTableWithPagination();  // Перерисовываем таблицу
            addObjForm.reset();  // Очищаем форму
            collection.save();
        } else {
            alert('Ошибка при добавлении объекта. Проверьте данные.');
        }
    });

    // Обработчик авторизации
    const adminLoginForm = document.getElementById('admin-login-form');
    if (adminLoginForm) {
        adminLoginForm.addEventListener('submit', function (event) {
            event.preventDefault();

            const login = document.getElementById('admin-login').value;
            const password = document.getElementById('admin-password').value;

            // Проверка логина и пароля
            if (login === 'admin' && password === 'password') {
                // Скрыть форму авторизации
                document.getElementById('admin').classList.add('hidden');
                // Показать админ-панель
                document.getElementById('admin-panel').classList.remove('hidden');

                // Показать таблицу объектов
                document.getElementById('obj-table').classList.remove('hidden');
            } else {
                alert('Неверный логин или пароль');
            }
        });
    }

    const sortAscButton = document.getElementById('sort-asc');
    sortAscButton.addEventListener('click', function () {
        collection.sortById('asc');
        console.log(collection)
        renderTableWithPagination();  // Обновляем таблицу
    });

    const sortDescButton = document.getElementById('sort-desc');
    sortDescButton.addEventListener('click', function () {
        console.log('Сортировка по убыванию');
        collection.sortById('desc');
        console.log(collection)
        renderTableWithPagination();  // Обновляем таблицу
    });

    renderTableWithPagination();  // Первоначальный рендер таблицы
});
