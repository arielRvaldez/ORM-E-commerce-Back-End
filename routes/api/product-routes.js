const router = require('express').Router();
const sequelize = require('../../config/connection');
const { Product, Category, Tag, ProductTag } = require('../../models');

// The `/api/products` endpoint

// get all products
router.get('/', async (req, res) => {
  // find all products
  try {
    const products = await Product.findAll({
      include: [{ model: Category, 
        attributes: ['id', 'category_name'] },
        { model: Tag,
          attributes: ['id', 'tag_name'],
          through: ProductTag,
          as: 'tags'
        }],
    });
    res.status(200).json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json(err);
  }
  // be sure to include its associated Category and Tag data
});

// get one product
router.get('/:id', async (req, res) => {
  // find a single product by its `id`
  try {
    const productId = req.params.id;
    const products = await Product.findByPk(productId, {
      include: [{ model: Category, 
        attributes: ['id', 'category_name'] },
        { model: Tag,
          attributes: ['id', 'tag_name'],
          through: ProductTag,
          as: 'tags'
        }],
    });
    if (!products) {
      res.status(404).json({ message: 'No product found with this id.' });
      return;
    }
    res.status(200).json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json(err);
  }
  // be sure to include its associated Category and Tag data
});

// create new product
router.post('/', (req, res) => {

    Product.create(req.body)
      .then((product) => {
        // if there's product tags, we need to create pairings to bulk create in the ProductTag model
        if (req.body.tagIds && req.body.tagIds.length > 0) {
          const productTagIdArr = req.body.tagIds.map((tag_id) => {
            return {
              product_id: product.id,
              tag_id,
            };
          });
          return ProductTag.bulkCreate(productTagIdArr);
        }
        // if no product tags, just respond
        res.status(200).json(product);
      })
      .then((productTagIds) => res.status(200).json(productTagIds))
      .catch((err) => {
        console.log(err);
        res.status(400).json(err);
      });
  });

  // update product
  router.put('/:id', (req, res) => {

    // update product data
    Product.update(req.body, {
      where: {
        id: req.params.id,
      },
    })
      .then((product) => {
        if (req.body.tagIds && req.body.tagIds.length > 0) {
          
          ProductTag.findAll({
            where: { product_id: req.params.id }
          }).then((productTags) => {
            // create filtered list of new tag_ids
            const productTagIds = productTags.map(({ tag_id }) => tag_id);
            const newTagIds = req.body.tagIds
            .filter((tag_id) => !productTagIds.includes(tag_id))
            const newProductTags = newTagIds.map((tag_id) => {
              return {
                product_id: req.params.id,
                tag_id,
              };
            });

              // figure out which ones to remove
            const productTagsToRemove = productTags
            .filter(({ tag_id }) => !req.body.tagIds.includes(tag_id))
            .map(({ id }) => id);
                    // run both actions
            return Promise.all([
              ProductTag.destroy({ where: { id: productTagsToRemove } }),
              ProductTag.bulkCreate(newProductTags),
            ]);
          });
        }

        return res.json(product);
      })
      .catch((err) => {
        // console.log(err);
        res.status(400).json(err);
      });
  });

router.delete('/:id', (req, res) => {
  // delete one product by its `id` value
  try {
    const products = Product.destroy({
      where: { id: req.params.id,
      },
    });
    
    if(!products) {
      res.status(404).json({ message: 'No product found with this id.' });
      return;
    }
    res.status(200).json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json(err);
  }
});

module.exports = router;
