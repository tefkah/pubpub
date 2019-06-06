export default (sequelize, dataTypes) => {
	return sequelize.define(
		'Merge',
		{
			id: sequelize.idType,
			note: { type: dataTypes.TEXT },
			/* Set by Associations */
			userId: { type: dataTypes.UUID, allowNull: false },
			pubId: { type: dataTypes.UUID, allowNull: false },
			sourceBranchId: { type: dataTypes.UUID, allowNull: false },
			destinationBranchId: { type: dataTypes.UUID, allowNull: false },
		},
		{
			classMethods: {
				associate: (models) => {
					const { Pub, User, Merge, Branch } = models;
					Pub.hasMany(Merge, {
						onDelete: 'CASCADE',
						as: 'merges',
						foreignKey: 'pubId',
					});
					Merge.belongsTo(User, {
						onDelete: 'CASCADE',
						as: 'user',
						foreignKey: 'userId',
					});
					Merge.belongsTo(Branch, {
						onDelete: 'CASCADE',
						as: 'sourceBranch',
						foreignKey: 'sourceBranchId',
					});
					Merge.belongsTo(Branch, {
						onDelete: 'CASCADE',
						as: 'destinationBranch',
						foreignKey: 'destinationBranchId',
					});
				},
			},
		},
	);
};
