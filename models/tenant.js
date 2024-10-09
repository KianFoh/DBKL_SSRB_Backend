// models/tenant.js
module.exports = (sequelize, DataTypes) => {
  const Tenant = sequelize.define('tenant', {
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    IC: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    image: {
      type: DataTypes.BLOB('long'), // Storing image as BLOB
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('Green', 'Yellow', 'Red', 'Grey'),
      allowNull: true,
      defaultValue: 'Grey'
    },
    location: {
      type: DataTypes.GEOMETRY('POINT'), // Storing geolocation as POINT
      allowNull: false
    }
  }, {
    // Other model options
  });

  return Tenant;
};