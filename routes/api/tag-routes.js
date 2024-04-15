const router = require('express').Router();
const sequelize = require('../../config/connection');
const { Tag, Product, ProductTag } = require('../../models');

// The `/api/tags` endpoint

router.get('/', async (req, res) => {
  // find all tags
  try {
    const tags = await Tag.findAll({
      include: [{ model: Product, 
        attributes: ['id', 'product_name'] },
        // { model: ProductTag,
        //   attributes: ['id', 'product_id', 'tag_id'],
        //   through: ProductTag,
        //   as: 'product-tags'
        // } 
      ],  
    }); 
    res.status(200).json(tags);
  } catch (err) {
    console.error(err);
    res.status(500).json(err);
  }
  // be sure to include its associated Product data
});

router.get('/:id', async (req, res) => {
  // find a single tag by its `id`
  try {
    const tagId = req.params.id;
    const tags = await Tag.findByPk(tagId, {
      include: [{ model: Product, 
        attributes: ['id', 'product_name'] },
        { model: ProductTag,
          attributes: ['id', 'product_id', 'tag_id'],
          as: 'product_tags'
        }],
    }); 
    
    if (!tags) {
      res.status(404).json({ message: 'No tag found with this id!' });
      return;
    }
    
    res.status(200).json(tags);
  } catch (err) {
    res.status(500).json(err);
  }
  // be sure to include its associated Product data
});

router.post('/', async (req, res) => {
  // create a new tag
  try {
    const tags = await Tag.create(req.body);
    res.status(200).json(tags);
  } catch (err) {
    res.status(400).json(err);
  }
});

router.put('/:id', async (req, res) => {
  // update a tag's name by its `id` value
  try {
    const tags = await Tag.update(req.body, {
      where: {
        id: req.params.id,
      },
    });

    if (!tags[0]) {
      res.status(404).json({ message: 'No tag found with this id!' });
      return;
    }

    res.status(200).json(tags);
  } catch (err) {
    console.error(err);
    res.status(400).json(err);
  }
});

router.delete('/:id', async (req, res) => {
  // delete on tag by its `id` value
  try {
    const tags = await Tag.destroy({
      where: {
        id: req.params.id,
      },
    });

    if (!tags) {
      res.status(404).json({ message: 'No tag found with this id!' });
      return;
    }

    res.status(200).json(tags);
  } catch (err) {
    console.error(err);
    res.status(500).json(err);
  }
});

module.exports = router;