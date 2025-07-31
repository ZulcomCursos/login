const Cliente = require('../models/mysql/Cliente');
const Plan = require('../models/mysql/Plan');

exports.list = async (req, res) => {
    try {
        const clientes = await Cliente.findAll({
            include: {
                model: Plan,
                as: 'Plan'
            }
        });
/**hola pepepepepepepeeeeee*/

/**juanito */
        res.render('clientes/index', { clientes, user: req.user });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al obtener los clientes');
    }
};

exports.createForm = async (req, res) => {
    try {
        const planes = await Plan.findAll();
        res.render('clientes/create', { planes, user: req.user });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al cargar el formulario');
    }
};

exports.create = async (req, res) => {
    try {
        const requiredFields = ['ip', 'nombre', 'apellido', 'cedula', 'correo', 'telefono1', 'direccion',
            'parroquia', 'canton', 'ciudad', 'provincia', 'discapacidad', 'id_plan'];

        for (const field of requiredFields) {
            if (!req.body[field]) {
                return res.status(400).send(`El campo ${field} es obligatorio`);
            }
        }

        await Cliente.create(req.body);
        res.redirect('/clientes');
    } catch (error) {
        console.error('Error al crear cliente:', error);
        res.status(500).render('error', {
            message: 'Error al crear el cliente',
            error: error.message,
            user: req.user
        });
    }
};

exports.editForm = async (req, res) => {
    try {
        const id = req.params.id;
        const cliente = await Cliente.findByPk(id);
        const planes = await Plan.findAll();

        if (!cliente) {
            return res.status(404).send('Cliente no encontrado');
        }

        res.render('clientes/edit', { cliente, planes, user: req.user });
    } catch (error) {
        console.error('Error al cargar formulario de edición:', error);
        res.status(500).send('Error al cargar el formulario de edición');
    }
};

exports.update = async (req, res) => {
    try {
        const id = req.params.id;
        const cliente = req.body;

        const requiredFields = ['ip', 'nombre', 'apellido', 'cedula', 'correo', 'telefono1',
            'direccion', 'parroquia', 'canton', 'ciudad', 'provincia',
            'discapacidad', 'id_plan'];

        for (const field of requiredFields) {
            if (!cliente[field]) {
                const clienteData = await Cliente.findByPk(id);
                const planesData = await Plan.findAll();

                return res.render('clientes/edit', {
                    cliente: clienteData,
                    planes: planesData,
                    error: `El campo ${field} es obligatorio`,
                    user: req.user
                });
            }
        }

        await Cliente.update(req.body, {
            where: { id_cliente: req.params.id }
        });

        res.redirect('/clientes');
    } catch (error) {
        console.error('Error detallado al actualizar cliente:', error.message);

        const clienteData = await Cliente.findByPk(req.params.id);
        const planesData = await Plan.findAll();

        res.render('clientes/edit', {
            cliente: clienteData,
            planes: planesData,
            error: 'Error al actualizar el cliente',
            user: req.user
        });
    }
};

exports.delete = async (req, res) => {
    try {
        const id = req.params.id;
        await Cliente.destroy({ where: { id } });
        res.redirect('/clientes');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al eliminar el cliente');
    }
};
