class RepositoryBase {
    constructor(model) {
        this.model = model;
    }

    getPrimaryKey() {
        return this.model.primaryKeyAttribute || 'id';
    }

    async findAll() {
        try { return await this.model.findAll(); } 
        catch (error) { console.log(error); return null; }
    }

    async create(entity) {
        try {
            console.log('🔵 RepositoryBase.create - Intentando crear:', entity);
            const result = await this.model.create(entity);
            return result;
        } catch (error) {
            console.error('🔴 RepositoryBase.create - Error:', error.message);
            return null;
        }
    }

    async findOne(id) {
        try {
            const pk = this.getPrimaryKey();
            return await this.model.findOne({ where: { [pk]: id } });
        } catch (error) { console.log(error); return null; }
    }

    async update(entity) {
        try {
            const pk = this.getPrimaryKey();
            const idValue = entity[pk]; 
            return await this.model.update(entity, { where: { [pk]: idValue } });
        } catch (error) { console.log(error); return null; }
    }

    async remove(id) {
        try {
            const pk = this.getPrimaryKey();
            return await this.model.destroy({ where: { [pk]: id } });
        } catch (error) { console.log(error); return null; }
    }
}
export default RepositoryBase; 