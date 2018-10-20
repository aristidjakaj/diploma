'use strict';
module.exports = (sequelize, DataTypes) => {
  var structured_file = sequelize.define('structured_file', {
    file_name: DataTypes.STRING,
    structured_pdf: DataTypes.TEXT
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    }
  });
  return structured_file;
};
