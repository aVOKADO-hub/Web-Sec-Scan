import Router from 'express'
import TestController from '../controllers/TestController.js'

const router = new Router()

router.post('/sql', TestController.testSQLInjection);
router.post('/xss', TestController.testXSS);
router.post('/headers', TestController.checkHeaders);

export default router;