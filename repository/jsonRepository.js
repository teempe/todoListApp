const { readFile, writeFile } = require('fs').promises;


class JsonRepository {

    #path;

    constructor(path='./data/todos.json') {
        this.#path = path;
    }

    async getAll() {
        return await this.#readData();
    }

    async addTask(description, isFinished=false) {
        const tasks = await this.#readData();

        const id = tasks.length === 0 ? 1 : this.#getMaxIndex(tasks) + 1;
        tasks.push({id, description, isFinished});
        await this.#writeData(tasks);

        return {id, description, isFinished};
    }

    async deleteTask(id) {
        const tasks = await this.#readData();
        const task = tasks.find(task => task.id === id);

        if (task) {
            const taskIdx = tasks.indexOf(task);
            tasks.splice(taskIdx, 1);
            await this.#writeData(tasks);
        
            return true;
        }

        return false;
    }

    async updateTask(id, description, isFinished) {
        const tasks = await this.#readData();
        const task = tasks.find(task => task.id === id);

        if (task) {
            const taskIdx = tasks.indexOf(task);
            tasks.splice(taskIdx, 1, {id, description, isFinished});
            await this.#writeData(tasks);
        
            return true;
        }

        return false;
    }

    async #readData() {
        try {
            const content = await readFile(this.#path);
            return JSON.parse(content);
        } catch(error) {
            console.error(error.message);
            return [];
        }
    }

    async #writeData(data) {
        try {
            await writeFile(this.#path, JSON.stringify(data));
            return true;
        } catch(error) {
            console.error(error.message);
            return false;
        }
    }

    #getMaxIndex(tasks) {
        return tasks
                .map(task => task.id)
                .sort((a, b) => a - b)
                .at(-1);
    }
}


module.exports = {
    JsonRepository,
}