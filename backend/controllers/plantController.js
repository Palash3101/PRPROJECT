import uploadToCloudinary from "../helpers/uploadToCloudinary.js";
import Plant from "../models/Plant.js";
import { removeFromCloudinary } from "../helpers/cloudinaryUtils.js";

// Add a new plant with image upload
const addPlant = async (req, res) => {
  try {
      console.log(req.body);

    const x= await Plant.insertOne({
      user: req.userId,
      plantType: req.body.plantType,  
      nickname: req.body.nickname,
      condition: req.body.condition,
      location: req.body.location,
      potSize: req.body.potSize,
      wateringNeeds: req.body.wateringNeeds,
      acquisitionDate: req.body.acquisitionDate,
      lastWatered: new Date(),
      lastFertilized: new Date()
    });

    return res.status(200).send(x);

  } catch (err) {
    console.error('Add plant error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to create plant',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// Update plant with image handling
const updatePlantImage = async (req, res) => {
  try {
    const plant = await Plant.findOne({ 
      _id: req.params.id, 
      user: req.userId 
    });

    if (!plant) {
      return res.status(404).json({
        success: false,
        message: 'Plant not found'
      });
    }

    const { 
      plantType,
      nickname,
      condition,
      location,
      potSize,
      acquisitionDate,
      avatarVariant,
      avatarExpression,
      avatarColor
    } = req.body;

    // Update plant data
    plant.plantType = plantType || plant.plantType;
    plant.nickname = nickname || plant.nickname;
    plant.condition = condition || plant.condition;
    plant.location = location || plant.location;
    plant.potSize = potSize || plant.potSize;
    plant.acquisitionDate = acquisitionDate || plant.acquisitionDate;

    // Handle avatar updates
    if (req.file) {
      try {
        // Delete old image if exists
        if (plant.avatar?.public_id) {
          await removeFromCloudinary(plant.avatar.public_id);
        }

        // Upload new image
        const uploadResult = await uploadToCloudinary(req.file, 'plants');
        plant.avatar = {
          variant: avatarVariant || plant.avatar?.variant || 1,
          expression: avatarExpression || plant.avatar?.expression || 'happy',
          color: avatarColor || plant.avatar?.color || 'default',
          url: uploadResult.url,
          public_id: uploadResult.public_id
        };
      } catch (uploadError) {
        console.error('Upload error:', uploadError);
        return res.status(500).json({
          success: false,
          message: 'Failed to update plant image'
        });
      }
    } else if (avatarVariant || avatarExpression || avatarColor) {
      plant.avatar = {
        ...plant.avatar,
        variant: avatarVariant || plant.avatar?.variant,
        expression: avatarExpression || plant.avatar?.expression,
        color: avatarColor || plant.avatar?.color
      };
    }

    const updatedPlant = await plant.save();
    res.json({
      success: true,
      data: updatedPlant
    });

  } catch (err) {
    console.error('Update plant error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to update plant'
    });
  }
};

// Get all plants for user
const getPlants = async (req, res) => {
  try {
    const plants = await Plant.find({ user: req.userId })
      .sort({ createdAt: -1 });
      
    res.json({
      success: true,
      count: plants.length,
      data: plants
    });
  } catch (err) {
    console.error('Get plants error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch plants'
    });
  }
};

// Get single plant
const getPlantById = async (req, res) => {
  try {
    const plant = await Plant.findOne({
      _id: req.params.id,
      user: req.userId
    });

    if (!plant) {
      return res.status(404).json({
        success: false,
        message: 'Plant not found'
      });
    }

    res.json({
      success: true,
      data: plant
    });
  } catch (err) {
    console.error('Get plant error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch plant'
    });
  }
};

// Delete plant with image cleanup
const deletePlant = async (req, res) => {
  try {
    const plant = await Plant.findOneAndDelete({
      _id: req.params.id,
      user: req.userId
    });

    if (!plant) {
      return res.status(404).json({
        success: false,
        message: 'Plant not found'
      });
    }

    // Remove image from Cloudinary if exists
    if (plant.avatar?.public_id) {
      try {
        await removeFromCloudinary(plant.avatar.public_id);
      } catch (cleanupError) {
        console.error('Image cleanup error:', cleanupError);
      }
    }

    res.json({
      success: true,
      message: 'Plant deleted successfully'
    });
  } catch (err) {
    console.error('Delete plant error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to delete plant'
    });
  }
};

const updateCareMetric = async (plantId, metric, valueChange, actionName) => {
  const plant = await Plant.findById(plantId);
  if (!plant) {
    throw new Error('Plant not found');
  }

  // Initialize careMetrics if not exists
  if (!plant.careMetrics) {
    plant.careMetrics = {
      water: 0,
      sunlight: 0,
      fertilizer: 0,
      temperature: 0
    };
  }

  // Update the specific metric (clamped between 0-100)
  plant.careMetrics[metric] = Math.min(100, Math.max(0, plant.careMetrics[metric] + valueChange));

  // Add to care history
  plant.careHistory = plant.careHistory || [];
  plant.careHistory.push({
    action: actionName,
    date: new Date()
  });

  // Update last interaction time based on action
  if (metric === 'water') {
    plant.lastWatered = new Date();
  }

  await plant.save();
  return plant;
};

const waterPlant = async (req, res) => {
  try {
    const plant = await updateCareMetric(req.params.id, 'water', 30, 'Watered');
    res.status(200).json({
      status: 'success',
      data: {
        plant
      }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

const adjustSunlight = async (req, res) => {
  try {
    const plant = await updateCareMetric(req.params.id, 'sunlight', 25, 'Adjusted sunlight');
    res.status(200).json({
      status: 'success',
      data: {
        plant
      }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

const fertilizePlant = async (req, res) => {
  try {
    const plant = await updateCareMetric(req.params.id, 'fertilizer', 20, 'Fertilized');
    res.status(200).json({
      status: 'success',
      data: {
        plant
      }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

const updatePlant = async (req, res) => {
  let plantData = req.body.plant;

  const plant = await Plant.updateOne(
    { _id: plantData._id, user: req.userId },
    { $set: plantData }
  );

  if (!plant) {
    return res.status(404).json({
      success: false,
      message: 'Plant not found'
    });
  }
  else{
    return res.status(200).json({
      success: true,
      data: plantData
    });
  }
}

export default {
  addPlant,
  getPlants,
  getPlantById,
  updatePlant,
  deletePlant,
  waterPlant,
  adjustSunlight,
  fertilizePlant,
  updatePlantImage
};