#!/usr/bin/env python3
"""Replace inline modals with component imports in BusinessAdminDashboard"""

# Read the file
with open('src/pages/BusinessAdminDashboard.jsx', 'r') as f:
    lines = f.readlines()

# Find the line numbers
start_line = None
end_line = None

for i, line in enumerate(lines):
    if '/* Create Staff Modal */' in line and start_line is None:
        start_line = i
    if '// JWT Debug Panel Component' in line:
        end_line = i
        break

print(f"Found modals section: lines {start_line+1} to {end_line}")

# Replacement content
replacement = """
      {/* Modals - Using Shared Components */}
      <CreateStaffModal
        isOpen={showCreateStaffModal}
        onClose={() => setShowCreateStaffModal(false)}
        staffForm={staffForm}
        onFormChange={handleStaffFormChange}
        onSubmit={handleCreateStaff}
      />

      <EditStaffModal
        isOpen={!!editingStaff}
        onClose={() => setEditingStaff(null)}
        staffForm={staffForm}
        onFormChange={handleStaffFormChange}
        onSubmit={handleUpdateStaff}
      />

      <CreateCategoryModal
        isOpen={showCreateCategoryModal}
        onClose={() => setShowCreateCategoryModal(false)}
        categoryForm={categoryForm}
        onFormChange={handleCategoryFormChange}
        onSubmit={handleCreateCategory}
      />

      <EditCategoryModal
        isOpen={!!editingCategory}
        onClose={() => setEditingCategory(null)}
        categoryForm={categoryForm}
        onFormChange={handleCategoryFormChange}
        onSubmit={handleUpdateCategory}
      />

      <CreateProductModal
        isOpen={showCreateProductModal}
        onClose={() => setShowCreateProductModal(false)}
        productForm={productForm}
        onFormChange={handleProductFormChange}
        onSubmit={handleCreateProduct}
        categories={categories}
      />

      <EditProductModal
        isOpen={!!editingProduct}
        onClose={() => setEditingProduct(null)}
        productForm={productForm}
        onFormChange={handleProductFormChange}
        onSubmit={handleUpdateProduct}
        categories={categories}
      />

      <CreateVenueModal
        isOpen={showCreateVenueModal}
        onClose={() => setShowCreateVenueModal(false)}
        venueForm={venueForm}
        onFormChange={handleVenueFormChange}
        onSubmit={handleCreateVenue}
      />

      <EditVenueModal
        isOpen={!!editingVenue}
        onClose={() => setEditingVenue(null)}
        venueForm={venueForm}
        onFormChange={handleVenueFormChange}
        onSubmit={handleUpdateVenue}
      />

      <CreateZoneModal
        isOpen={showCreateZoneModal && selectedVenue}
        onClose={() => setShowCreateZoneModal(false)}
        zoneForm={zoneForm}
        onFormChange={handleZoneFormChange}
        onSubmit={handleCreateZone}
        venueName={selectedVenue?.name}
      />

      <EditZoneModal
        isOpen={!!editingZone}
        onClose={() => setEditingZone(null)}
        zoneForm={zoneForm}
        onFormChange={handleZoneFormChange}
        onSubmit={handleUpdateZone}
        venueName={selectedVenue?.name}
      />

"""

# Create new content
new_lines = lines[:start_line] + [replacement] + lines[end_line:]

# Write back
with open('src/pages/BusinessAdminDashboard.jsx', 'w') as f:
    f.writelines(new_lines)

print(f"✅ Replaced {end_line - start_line} lines with {len(replacement.split(chr(10)))} lines")
print(f"   Old file: {len(lines)} lines")
print(f"   New file: {len(new_lines)} lines")
print(f"   Reduction: {len(lines) - len(new_lines)} lines ({((len(lines) - len(new_lines)) / len(lines) * 100):.1f}%)")
