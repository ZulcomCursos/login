const Plan = require('../models/mysql/Plan');

exports.list = async (req, res) => {
  try {
    const planes = await Plan.findAll({ order: [['id_plan', 'ASC']] });
    res.render('planes/index', { planes, user: req.user });
  } catch (error) {
    console.error('Error al obtener los planes:', error);
    res.status(500).send('Error al obtener los planes');
  }
};

exports.createForm = (req, res) => {
  res.render('planes/create', { user: req.user });
};

exports.create = async (req, res) => {
  try {
    const { nombre_plan, costo, megas } = req.body;

    if (!nombre_plan || !costo || !megas) {
      return res.render('planes/create', {
        error: 'Todos los campos son obligatorios',
        plan: req.body,
        user: req.user
      });
    }

    await Plan.create({ nombre_plan, costo, megas });
    res.redirect('/planes');
  } catch (error) {
    console.error('Error al crear el plan:', error);
    res.render('planes/create', {
      error: 'Error al crear el plan',
      plan: req.body,
      user: req.user
    });
  }
};

exports.editForm = async (req, res) => {
  try {
    const id = req.params.id;
    const plan = await Plan.findByPk(id);

    if (!plan) {
      return res.status(404).send('Plan no encontrado');
    }

    res.render('planes/edit', { plan, user: req.user });
  } catch (error) {
    console.error('Error al cargar el formulario de edición:', error);
    res.status(500).send('Error al cargar el formulario de edición');
  }
};

exports.update = async (req, res) => {
  try {
    const id = req.params.id;
    const { nombre_plan, costo, megas } = req.body;

    if (!nombre_plan || !costo || !megas) {
      const plan = await Plan.findByPk(id);
      return res.render('planes/edit', {
        error: 'Todos los campos son obligatorios',
        plan: plan ? { ...plan.dataValues, ...req.body } : req.body,
        user: req.user
      });
    }

    const [updated] = await Plan.update(
      { nombre_plan, costo, megas },
      { where: { id_plan: id } }
    );

    if (updated === 0) {
      return res.status(404).send('Plan no encontrado para actualizar');
    }

    res.redirect('/planes');
  } catch (error) {
    console.error('Error al actualizar el plan:', error);
    const plan = await Plan.findByPk(req.params.id);
    res.render('planes/edit', {
      error: 'Error al actualizar el plan',
      plan: plan ? { ...plan.dataValues, ...req.body } : req.body,
      user: req.user
    });
  }
};

exports.delete = async (req, res) => {
  try {
    const id = req.params.id;
    const deleted = await Plan.destroy({ where: { id_plan: id } });

    if (deleted === 0) {
      return res.status(404).send('Plan no encontrado para eliminar');
    }

    res.redirect('/planes');
  } catch (error) {
    console.error('Error al eliminar el plan:', error);
    res.status(500).send('Error al eliminar el plan');
  }
};
