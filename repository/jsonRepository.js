const { readFile, writeFile } = require('fs').promises;

/**
 * Class representing storage in json file.
 */
class JsonRepository {

    #path;
    /**
     * Creates object to manage data stored in json file.
     * @param {String} [path='./data/todos.json'] path to json file
     */
    constructor(path='./data/todos.json') {
        this.#path = path;
    }

    /**
     * Gets all tasks stored in json file.
     * @returns {Array} Array of task objects or empty array if reading file fails.
     */
    async getAll() {
        return await this.#readData();
    }

    /**
     * Adds new task to json file.
     * @param {String} description Task description.
     * @param {Boolean} [isFinished=false] Is task marked as completed.
     * @returns {Object} Saved object or null if write to file fails
     */
    async addTask(description, isFinished=false) {
        const tasks = await this.#readData();

        const id = tasks.length === 0 ? 1 : this.#getMaxIndex(tasks) + 1;
        tasks.push({id, description, isFinished});
        const isSuccess = await this.#writeData(tasks);
        if (isSuccess) {
            return {id, description, isFinished};
        }

        return null;
    }

    /**
     * Removes task from json file.
     * @param {Number} id id identifier of task to be removed.
     * @returns {Boolean} true if deletion ends with success, false otherwise.
     */
    async deleteTask(id) {
        const tasks = await this.#readData();
        const task = tasks.find(task => task.id === id);

        if (task) {
            const taskIdx = tasks.indexOf(task);
            tasks.splice(taskIdx, 1);
            const isSuccess = await this.#writeData(tasks);
            if (isSuccess) {
                return true;
            } 
        }

        return false;
    }

    /**
     * Updates task stored in json file.
     * Full task object should be passed even for parameters that do not change.
     * @param {Number} id id identifier of task to be updated.
     * @param {String} description Task description.
     * @param {Boolean} isFinished Is task marked as completed.
     * @returns {Boolean} true if update ends with success, false otherwise.
     */
    async updateTask(id, description, isFinished) {
        const tasks = await this.#readData();
        const task = tasks.find(task => task.id === id);

        if (task) {
            const taskIdx = tasks.indexOf(task);
            tasks.splice(taskIdx, 1, {id, description, isFinished});
            const isSuccess = await this.#writeData(tasks);
            if (isSuccess) {
                return true;
            } 
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