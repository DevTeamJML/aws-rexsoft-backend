const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const fileManagerController = require('../../controllers/file_manager.controller');
const router = express.Router();

// router.get('/retrieve-all', auth(), fileManagerController.findAllCustomFields);
// router.post('/create', auth(), fileManagerController.createCustomField);
// router.delete('/remove', auth(), fileManagerController.removeCustomField);

router.get('/retrieve-all', fileManagerController.findAllFiles);
router.post('/create', fileManagerController.createFiles);
router.post('/remove', fileManagerController.removeFiles);

module.exports = router;

/**
 * @swagger
 * tags:
 *   name: File Manager
 *   description: File management and retrieval
 */

/**
 * @swagger
 * /file/retrieve-all:
 *   get:
 *     summary: Get file list
 *     description: Only logged in user can retrieve file list from current company.
 *     tags: [File Manager]
 *     parameters:
 *      - in: header
 *        name: company_id
 *        required: true
 *        schema:
 *          type: string
 *          default: "f972839551fa832ea1782ca03408276818ba3b6cdce"
 *          description: The company ID header (preset to "f972839551fa832ea1782ca03408276818ba3b6cdce")
 *     responses:
 *       "200":
 *         description: OK
 */

/**
 * @swagger
 * /file/create:
 *   post:
 *     summary: Create custom field
 *     description: Custom field name cannot be same within a company
 *     tags: [File Manager]
 *     parameters:
 *      - in: header
 *        name: company_id
 *        required: true
 *        schema:
 *          type: string
 *          default: "f972839551fa832ea1782ca03408276818ba3b6cdce"
 *          description: The company ID header (preset to "f972839551fa832ea1782ca03408276818ba3b6cdce")
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *             properties:
 *             example:
 *     responses:
 *       "200":
 *         description: OK
 */

/**
 * @swagger
 * /file/remove:
 *   delete:
 *     summary: Remove file
 *     description: Only unused file can be removed
 *     tags: [File Manager]
 *     parameters:
 *      - in: query
 *        name: file_id
 *        required: true
 *        schema:
 *          type: string
 *          default: ""
 *     responses:
 *       "200":
 *         description: OK
 */
