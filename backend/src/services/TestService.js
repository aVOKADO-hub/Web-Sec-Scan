import mongoose from 'mongoose';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import testModel from '../models/testModel.js'

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class TestService {
    constructor() {
        this.connection = null;
    }

    async connect() {
        if (!this.connection) {
            this.connection = await mongoose.connect('mongodb://localhost:27017/OwaspClone', {
                useNewUrlParser: true,
                useUnifiedTopology: true
            });
        }
    }

    getModel(collectionName) {
        return mongoose.model(collectionName, postSchema);
    }

    
}

export default new TestService();
