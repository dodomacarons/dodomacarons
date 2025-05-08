import express from 'express';
import { Waste } from './schemas/Waste';
import cors from 'cors';
import mongoose, { SortOrder } from 'mongoose';
import morgan from 'morgan';
import { DateTime } from 'luxon';
import { authMiddleware } from './auth.middleware';
import logger from './logger';

const host = process.env.HOST ?? '0.0.0.0';
const port = process.env.PORT ? +process.env.PORT : 4201;
const mongoConnectionString = process.env.MONGO_DB_CONNECTION_STRING ?? '';

const app = express();

app.use(
  cors({
    origin: [
      'http://localhost:4200',
      'https://spiffy-jelly-837cfe.netlify.app',
      'https://dodomacarons.duckdns.org',
      'https://dodomacarons.onrender.com',
    ],
  })
);

app.use(express.json());

app.use(
  morgan('combined', {
    stream: {
      write: (message: string) => logger.http(message.trim()),
    },
  })
);

mongoose
  .connect(mongoConnectionString)
  .then(() => logger.info('MongoDB connected'))
  .catch((err) => logger.error(`MongoDB connection error: ${err.message}`));

app.get('/', (req, res) => {
  res.send({ message: 'Hello API' });
});

app.get('/api/waste', authMiddleware, async (req, res) => {
  try {
    const { displayDate, flavor } = req.query;
    const page = parseInt(req.query.page as string, 10) || 0;
    const pageSize = parseInt(req.query.pageSize as string, 10) || 100;
    const sortModel = req.query.sortModel
      ? JSON.parse((req.query.sortModel as string) || '[]')
      : [];
    const filter: {
      displayDate?: { $gte: Date; $lte: Date };
      flavor?: string;
    } = {};

    if (displayDate) {
      const start = DateTime.fromISO(displayDate as string)
        .startOf('day')
        .toJSDate();
      const end = DateTime.fromISO(displayDate as string)
        .endOf('day')
        .toJSDate();

      filter.displayDate = { $gte: start, $lte: end };
    }

    if (flavor && typeof flavor === 'string') {
      filter.flavor = flavor;
    }

    const sort: Record<string, SortOrder> = {};
    if (Array.isArray(sortModel) && sortModel.length > 0) {
      sortModel.forEach(({ field, sort: direction }) => {
        sort[field] = direction === 'asc' ? 1 : -1;
      });
    }

    const total = await Waste.countDocuments(filter);
    const wastes = await Waste.find(filter)
      .skip(page * pageSize)
      .sort(sort)
      .limit(pageSize);

    res.status(200).json({
      message: 'Wastes retrieved successfully',
      data: wastes,
      total,
    });
  } catch (error) {
    logger.error(`error fetching wastes: ${(error as Error).message}'`);
    res.status(500).json({ message: 'Error fetching waste entries', error });
  }
});

app.get('/api/aggregate1', authMiddleware, async (req, res) => {
  try {
    const { dateFrom, dateTo } = req.query;
    const start = DateTime.fromISO(dateFrom as string)
      .startOf('day')
      .toJSDate();
    const end = DateTime.fromISO(dateTo as string)
      .endOf('day')
      .toJSDate();

    const result = await Waste.aggregate([
      {
        $match: {
          manufacturingDate: { $gte: start, $lte: end },
        },
      },
      {
        $group: {
          _id: '$flavor',
          totalManufacturingWaste: { $sum: '$manufacturingWasteQuantity' },
          totalShippingWaste: { $sum: '$shippingWasteQuantity' },
          totalDisplayed: { $sum: '$displayedQuantity' },
        },
      },
      {
        $project: {
          flavor: '$_id',
          _id: 0,
          totalManufacturingWaste: 1,
          totalShippingWaste: 1,
          totalDisplayed: 1,
          totalWaste: {
            $add: ['$totalManufacturingWaste', '$totalShippingWaste'],
          },
          wasteRatio: {
            $cond: [
              { $eq: ['$totalDisplayed', 0] },
              0,
              {
                $round: [
                  {
                    $multiply: [
                      {
                        $divide: [
                          {
                            $add: [
                              '$totalManufacturingWaste',
                              '$totalShippingWaste',
                            ],
                          },
                          '$totalDisplayed',
                        ],
                      },
                      100,
                    ],
                  },
                  2,
                ],
              },
            ],
          },
        },
      },
      {
        $sort: { flavor: 1 },
      },
    ]);
    res
      .status(200)
      .json({ message: 'Wastes retrieved successfully', data: result });
  } catch (error) {
    logger.error(`error fetching wastes: ${(error as Error).message}`);
    res.status(500).json({ message: 'Error fetching waste entries', error });
  }
});

app.get('/api/aggregate2', authMiddleware, async (req, res) => {
  try {
    const { dateFrom, dateTo } = req.query;
    const start = DateTime.fromISO(dateFrom as string)
      .startOf('day')
      .toJSDate();
    const end = DateTime.fromISO(dateTo as string)
      .endOf('day')
      .toJSDate();

    const result = await Waste.aggregate([
      {
        $match: {
          manufacturingDate: { $gte: start, $lte: end },
        },
      },
      {
        $group: {
          _id: '$manufacturingDate',
          totalManufacturingWaste: { $sum: '$manufacturingWasteQuantity' },
          totalShippingWaste: { $sum: '$shippingWasteQuantity' },
        },
      },
      {
        $project: {
          manufacturingDate: '$_id',
          _id: 0,
          totalManufacturingWaste: 1,
          totalShippingWaste: 1,
          totalWaste: {
            $add: ['$totalManufacturingWaste', '$totalShippingWaste'],
          },
        },
      },
      {
        $sort: { manufacturingDate: 1 },
      },
    ]);
    res
      .status(200)
      .json({ message: 'Wastes retrieved successfully', data: result });
  } catch (error) {
    logger.error(`error fetching wastes: ${(error as Error).message}`);
    res.status(500).json({ message: 'Error fetching waste entries', error });
  }
});

app.post('/api/waste', authMiddleware, async (req, res) => {
  logger.info('attempting to create a new waste record');
  try {
    const {
      manufacturingDate,
      releaseDate,
      displayDate,
      flavor,
      displayedQuantity,
      manufacturingWasteQuantity,
      manufacturingWasteReason,
      shippingWasteQuantity,
    } = req.body;

    const newWaste = new Waste({
      manufacturingDate,
      releaseDate,
      displayDate,
      flavor,
      displayedQuantity,
      manufacturingWasteQuantity,
      manufacturingWasteReason,
      shippingWasteQuantity,
    });

    await newWaste.save();

    logger.info(`waste record created successfully with id: ${newWaste._id}`);

    res
      .status(201)
      .json({ message: 'Waste entry created successfully', data: newWaste });
  } catch (error) {
    logger.error(
      `failed to to create a new waste record: ${(error as Error).message}`
    );

    res.status(500).json({
      message: 'Error creating waste entry',
      error,
    });
  }
});

app.patch('/api/waste/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  logger.info(`attempting to update waste record with id: ${id}`);

  if (!mongoose.Types.ObjectId.isValid(id)) {
    logger.error(`invalid mongo id: ${id}`);
    res.status(400).json({ error: 'Invalid ID' });
    return;
  }

  logger.info(`mongo id, ${id} is valid, proceeding`);

  try {
    const updatedWaste = await Waste.findByIdAndUpdate(
      new mongoose.Types.ObjectId(id),
      {
        ...updates,
        updatedAt: new Date(),
      },
      { new: true, runValidators: true }
    );

    if (!updatedWaste) {
      logger.error(`waste record not found in db, id: ${id}`);
      res.status(404).json({ error: 'Waste not found' });
      return;
    }

    logger.info(`waste record updated successfully, id: ${id}`);

    res.json({
      message: 'Waste entry updated successfully',
      data: updatedWaste,
    });
  } catch (error) {
    logger.error(`error updating waste record: ${(error as Error).message}`);
    res.status(500).json({
      message: 'Error updating waste entry',
      error,
    });
  }
});

app.delete('/api/waste/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  logger.info(`attempting to delete a waste record with id ${id}`);
  try {
    const result = await Waste.findByIdAndDelete(id);
    if (!result) {
      logger.error(`waste record not found in db, id: ${id}`);
      res.status(404).json({ message: 'Entry not found' });
      return;
    }
    logger.info(`waste record deleted successfully, id: ${id}`);
    res.json({ message: 'Entry deleted successfully' });
  } catch (error) {
    logger.error(`error deleting waste record: ${(error as Error).message}`);
    res.status(500).json({
      message: 'Error deleting waste entry',
      error,
    });
  }
});

app.listen(port, host, () => {
  logger.info(`app is running on http://${host}:${port}`);
});
