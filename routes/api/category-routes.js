const router = require('express').Router();
const { Category, Product } = require('../../models');

// The `/api/categories` endpoint

router.get('/', async (req, res) => {
  // find all categories
  try {
    const categories = await Category.findAll({
      include: [{ model: Product, 
        attributes: ['id', 'product_name', 'price', 'stock', 'category_id'] }],
    });
    res.status(200).json(categories);
  } catch (err) {
    console.error(err);
    res.status(500).json(err);
  }
  // be sure to include its associated Products
});

router.get('/:id', async (req, res) => {
  // find one category by its `id` value
  // Category.findOne({
  //   where: {
  //     id: req.params.id,
  //   },
  //   include: [Product],
  // })
  //   .then((category) => res.json(category))
  //   .catch((err) => res.status(400).json(err));
  try {
    const categoryId = req.params.id;
    const categories = await Category.findByPk(categoryId, {
      include: [{ model: Product, 
        attributes: ['id', 'product_name', 'price', 'stock', 'category_id'] }],
    });
    if (!categories) {
      res.status(404).json({ message: 'No category found with this id.' });
      return;
    }
    res.status(200).json(categories);
  } catch (err) {
    console.error(err);
    res.status(500).json(err);
  }
  // be sure to include its associated Products
});

router.post('/', async (req, res) => {
  // create a new category
  try {
  const category = await Category.create(req.body)
    res.status(200).json(category);
  } catch (err) {
    console.error(err)
    res.status(500).json(err);
  }
  });

router.put('/:id', async (req, res) => {
  // update a category by its `id` value
  Category.update(req.body, {
    where: {
      id: req.params.id,
    },
  })
    .then((category) => res.status(200).json(category))
    .catch((err) => res.status(400).json(err));
});

router.delete('/:id', (req, res) => {
  // delete a category by its `id` value
  Category.destroy({
    where: {
      id: req.params.id,
    },
  }).then((category) => res.status(200).json(category))
    .catch((err) => res.status(400).json(err));
});

module.exports = router;
