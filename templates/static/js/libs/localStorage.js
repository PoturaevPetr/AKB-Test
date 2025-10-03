class Model {
    constructor(tablename, columns = [], relations) {
        this.tablename = tablename;
        this.columns = columns;
        this.relations = relations
        if (!localStorage.getItem(this.tablename)) {
            localStorage.setItem(this.tablename, JSON.stringify([]));
        }
    }

    get(id) {
        const data = JSON.parse(localStorage.getItem(this.tablename));
        return data.find(item => item.id === id);
    }

    add(args) {
        const data = JSON.parse(localStorage.getItem(this.tablename));
        const newItem = { ...args };
        data.push(newItem);
        localStorage.setItem(this.tablename, JSON.stringify(data));
        return newItem;
    }

    delete(id) {
        let data = JSON.parse(localStorage.getItem(this.tablename));
        data = data.filter(item => item.id !== id);
        localStorage.setItem(this.tablename, JSON.stringify(data));
    }

    all() {
        return JSON.parse(localStorage.getItem(this.tablename));
    }
    first() {
        const data = this.all();
        return data.length > 0 ? data[0] : null;
    }

    filter(filterFn) {
        const data = JSON.parse(localStorage.getItem(this.tablename));
        return data.filter(filterFn);
    }

    update(id, updatedFields) {
        const data = JSON.parse(localStorage.getItem(this.tablename));
        const index = data.findIndex(item => item.id === id);
        if (index === -1) {
            return null; // Объект не найден
        }
        // Обновляем поля
        data[index] = { ...data[index], ...updatedFields };
        localStorage.setItem(this.tablename, JSON.stringify(data));
        return data[index]; // Возвращаем обновленный объект
    }
    getRelation(instance, relationName) {
        const relation = this.relations[relationName];
        if (!relation) return null;

        const foreignKeyValue = instance[relation.key];
        if (!foreignKeyValue) return null;

        return relation.model.get(foreignKeyValue);
    }

    // Получение связанных объектов (например, один ко многим)
    getRelatedInstances(instance, relationName) {
        const relation = this.relations[relationName];
        if (!relation) return [];

        return relation.model.filter(item => item[relation.foreignKey] === instance.id);
    }
}

class Session {
    constructor() { }
    query(model) {
        return {
            filter: (filterFn) => model.filter(filterFn),
            get: (id) => model.get(id),
            add: (args) => model.add(args),
            delete: (id) => model.delete(id),
            all: () => model.all(),
            update: (id, updatedFields) => model.update(id, updatedFields),
            first: (filterFn) => model.first(filterFn)
        };
    }
}
