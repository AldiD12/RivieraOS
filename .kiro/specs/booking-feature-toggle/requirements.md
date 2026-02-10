# Requirements Document: Booking Feature Toggle System

## Introduction

The Booking Feature Toggle System enables a two-tier business model for the Riviera platform. SuperAdmins control which businesses have access to premium booking features, allowing the platform to offer both a free call-only tier and a premium online booking tier. This system provides revenue opportunities through tiered pricing while maintaining a low barrier to entry for new businesses.

The system distinguishes between two business models:
1. **Free Tier (Call-Only)**: Businesses display venue capacity and contact information; customers call to book
2. **Premium Tier (Full Booking)**: Businesses get online booking, visual sunbed mapper, collector dashboard, and real-time availability tracking

## Glossary

- **SuperAdmin**: Platform administrator with full system access who controls feature enablement for businesses
- **Business**: A company or organization that owns one or more venues (e.g., "Beach Paradise Group")
- **Business_Owner**: User with Manager role who administers a business account
- **Venue**: A physical location owned by a business where customers can book sunbeds (e.g., "Beach Club")
- **Booking_Feature**: The premium feature set including online booking, sunbed mapper, and collector dashboard
- **Call_Only_Mode**: Free tier where customers see capacity information and must call to book
- **Premium_Mode**: Paid tier with full online booking capabilities
- **Collector**: Staff role responsible for managing sunbed check-ins and check-outs (only available in Premium_Mode)
- **Sunbed_Mapper**: Visual tool for configuring sunbed layouts (only available in Premium_Mode)
- **Feature_Toggle**: Boolean flag controlled by SuperAdmin that enables or disables Booking_Feature for a Business
- **Customer_App**: Mobile application used by end customers to discover and book venues
- **Discovery_Page**: Customer-facing page showing available venues with appropriate UI based on Feature_Toggle

## Requirements

### Requirement 1: SuperAdmin Feature Control

**User Story:** As a SuperAdmin, I want to control which businesses have access to premium booking features, so that I can manage platform revenue and feature access.

#### Acceptance Criteria

1. WHEN a SuperAdmin creates a new Business, THE System SHALL allow the SuperAdmin to set the Feature_Toggle value
2. WHEN a SuperAdmin edits an existing Business, THE System SHALL allow the SuperAdmin to change the Feature_Toggle value
3. WHEN a SuperAdmin changes a Feature_Toggle value, THE System SHALL persist the change immediately to the database
4. WHEN a SuperAdmin views the business list, THE System SHALL display the current Feature_Toggle status for each Business
5. THE System SHALL default Feature_Toggle to false for all new businesses unless explicitly enabled by SuperAdmin
6. WHEN a SuperAdmin disables a Feature_Toggle for a Business, THE System SHALL immediately restrict access to premium features for that Business

### Requirement 2: Business Owner Feature Visibility

**User Story:** As a Business Owner, I want to see which features are enabled for my business, so that I understand what capabilities I have access to.

#### Acceptance Criteria

1. WHEN a Business_Owner logs into the dashboard, THE System SHALL display the current Feature_Toggle status for their Business
2. WHEN Feature_Toggle is false, THE System SHALL display a banner indicating Call_Only_Mode with upgrade information
3. WHEN Feature_Toggle is true, THE System SHALL display a banner indicating Premium_Mode is active
4. THE System SHALL prevent Business_Owner from modifying their own Feature_Toggle value
5. WHEN Feature_Toggle is false, THE System SHALL hide Sunbed_Mapper and collector-related navigation items from the Business_Owner dashboard

### Requirement 3: Database Schema for Feature Toggle

**User Story:** As a system architect, I want to store the Feature_Toggle at the Business level, so that all venues under a business inherit the same feature access.

#### Acceptance Criteria

1. THE System SHALL store Feature_Toggle as a boolean column in the Business table
2. THE System SHALL set the default value of Feature_Toggle to false for new Business records
3. WHEN a Business record is created, THE System SHALL initialize Feature_Toggle based on SuperAdmin input
4. WHEN querying Business data, THE System SHALL include the Feature_Toggle value in the response
5. WHEN querying Venue data, THE System SHALL include the parent Business Feature_Toggle value in the response

### Requirement 4: Staff Role Restrictions

**User Story:** As a Business Owner, I want the system to restrict staff roles based on my feature access, so that I only see relevant options for my tier.

#### Acceptance Criteria

1. WHEN Feature_Toggle is false, THE System SHALL prevent creation of Collector staff members
2. WHEN Feature_Toggle is true, THE System SHALL allow creation of Manager, Bartender, and Collector staff members
3. WHEN Feature_Toggle is false, THE System SHALL only allow creation of Manager and Bartender staff members
4. WHEN displaying staff role options, THE System SHALL filter available roles based on Feature_Toggle value
5. WHEN Feature_Toggle changes from true to false, THE System SHALL maintain existing Collector staff but prevent new Collector creation

### Requirement 5: Customer Discovery Page Display

**User Story:** As a customer, I want to see appropriate booking options based on the venue's tier, so that I understand how to reserve a sunbed.

#### Acceptance Criteria

1. WHEN Feature_Toggle is false for a Venue's Business, THE Customer_App SHALL display Call_Only_Mode interface
2. WHEN Feature_Toggle is true for a Venue's Business, THE Customer_App SHALL display Premium_Mode interface with booking capabilities
3. WHEN displaying Call_Only_Mode, THE System SHALL show total venue capacity and zone capacities
4. WHEN displaying Call_Only_Mode, THE System SHALL show phone and WhatsApp contact buttons
5. WHEN displaying Call_Only_Mode, THE System SHALL show availability status as "Call for availability"
6. WHEN displaying Premium_Mode, THE System SHALL show visual sunbed map and online booking button
7. WHEN displaying Premium_Mode, THE System SHALL show real-time availability status

### Requirement 6: SuperAdmin API Endpoints

**User Story:** As a SuperAdmin, I want API endpoints to manage business feature toggles, so that I can control feature access programmatically.

#### Acceptance Criteria

1. THE System SHALL provide a POST endpoint for creating businesses with Feature_Toggle parameter
2. THE System SHALL provide a PATCH endpoint for updating Feature_Toggle on existing businesses
3. THE System SHALL provide a GET endpoint that returns Business data including Feature_Toggle value
4. WHEN SuperAdmin calls the PATCH endpoint, THE System SHALL validate SuperAdmin authorization before allowing changes
5. WHEN SuperAdmin updates Feature_Toggle, THE System SHALL return the updated Business data including new Feature_Toggle value

### Requirement 7: Business Owner API Endpoints

**User Story:** As a Business Owner, I want to retrieve my business profile including feature status, so that my dashboard can display appropriate UI.

#### Acceptance Criteria

1. THE System SHALL provide a GET endpoint for Business_Owner to retrieve their business profile
2. WHEN Business_Owner requests their profile, THE System SHALL include Feature_Toggle value in the response
3. THE System SHALL prevent Business_Owner from accessing endpoints that modify Feature_Toggle
4. WHEN Business_Owner requests venue data, THE System SHALL include parent Business Feature_Toggle in the response

### Requirement 8: Dashboard Conditional Rendering

**User Story:** As a Business Owner, I want my dashboard to show only features I have access to, so that I'm not confused by unavailable options.

#### Acceptance Criteria

1. WHEN Feature_Toggle is false, THE System SHALL hide the Sunbed_Mapper navigation tab
2. WHEN Feature_Toggle is false, THE System SHALL hide the Sunbed Manager navigation tab
3. WHEN Feature_Toggle is false, THE System SHALL hide Collector role option in staff creation forms
4. WHEN Feature_Toggle is true, THE System SHALL display all navigation tabs including Sunbed_Mapper and Sunbed Manager
5. WHEN Feature_Toggle is true, THE System SHALL display all staff role options including Collector

### Requirement 9: Call-Only Mode Customer Experience

**User Story:** As a customer viewing a call-only venue, I want to see capacity information and contact options, so that I can call to make a reservation.

#### Acceptance Criteria

1. WHEN viewing a Call_Only_Mode venue, THE Customer_App SHALL display total venue capacity as a number
2. WHEN viewing a Call_Only_Mode venue, THE Customer_App SHALL display capacity for each zone
3. WHEN viewing a Call_Only_Mode venue, THE Customer_App SHALL display a "Call Us" button with phone number
4. WHEN viewing a Call_Only_Mode venue with WhatsApp number, THE Customer_App SHALL display a WhatsApp button
5. WHEN customer clicks "Call Us" button, THE System SHALL open the device phone dialer with the venue phone number
6. WHEN customer clicks WhatsApp button, THE System SHALL open WhatsApp with the venue WhatsApp number
7. WHEN viewing a Call_Only_Mode venue, THE Customer_App SHALL display availability status as "Call for availability"

### Requirement 10: Premium Mode Customer Experience

**User Story:** As a customer viewing a premium venue, I want to see real-time availability and book online, so that I can reserve a specific sunbed without calling.

#### Acceptance Criteria

1. WHEN viewing a Premium_Mode venue, THE Customer_App SHALL display a visual sunbed map
2. WHEN viewing a Premium_Mode venue, THE Customer_App SHALL display real-time availability for each sunbed
3. WHEN viewing a Premium_Mode venue, THE Customer_App SHALL display a "View Sunbed Map & Book" button
4. WHEN customer clicks the booking button, THE System SHALL navigate to the sunbed selection interface
5. WHEN viewing a Premium_Mode venue, THE Customer_App SHALL show specific sunbed identifiers (e.g., A1, B5)

### Requirement 11: Migration and Default Behavior

**User Story:** As a system administrator, I want existing businesses to default to free tier, so that we can gradually roll out premium features.

#### Acceptance Criteria

1. WHEN the Feature_Toggle column is added to the database, THE System SHALL set all existing Business records to false
2. WHEN a new Business is created without explicit Feature_Toggle value, THE System SHALL default to false
3. THE System SHALL allow SuperAdmin to enable Feature_Toggle for existing businesses at any time
4. WHEN Feature_Toggle is enabled for an existing Business, THE System SHALL immediately grant access to premium features

### Requirement 12: SuperAdmin UI Confirmation

**User Story:** As a SuperAdmin, I want confirmation dialogs when changing feature toggles, so that I don't accidentally enable or disable features.

#### Acceptance Criteria

1. WHEN SuperAdmin attempts to enable Feature_Toggle, THE System SHALL display a confirmation dialog describing premium features
2. WHEN SuperAdmin attempts to disable Feature_Toggle, THE System SHALL display a confirmation dialog warning about feature removal
3. WHEN SuperAdmin confirms the change, THE System SHALL update the Feature_Toggle value
4. WHEN SuperAdmin cancels the confirmation, THE System SHALL maintain the current Feature_Toggle value
5. THE System SHALL display success feedback after Feature_Toggle is changed

### Requirement 13: Venue Data Inheritance

**User Story:** As a system architect, I want venues to inherit feature access from their parent business, so that feature control is centralized at the business level.

#### Acceptance Criteria

1. THE System SHALL NOT store Feature_Toggle at the Venue level
2. WHEN querying Venue data, THE System SHALL include the parent Business Feature_Toggle value
3. WHEN Feature_Toggle changes for a Business, THE System SHALL apply the change to all venues under that Business
4. THE System SHALL determine venue feature access by checking the parent Business Feature_Toggle value
5. WHEN displaying venue information, THE System SHALL use the parent Business Feature_Toggle to determine UI rendering

### Requirement 14: Contact Information Requirements

**User Story:** As a Business Owner in call-only mode, I want to ensure my venues have contact information, so that customers can reach me.

#### Acceptance Criteria

1. WHEN Feature_Toggle is false, THE System SHALL require phone number for each Venue
2. WHEN creating or editing a Venue with Feature_Toggle false, THE System SHALL validate that phone number is provided
3. THE System SHALL allow optional WhatsApp number for all venues
4. WHEN Feature_Toggle is true, THE System SHALL make phone number optional for venues
5. WHEN displaying Call_Only_Mode venues, THE System SHALL show the venue phone number prominently

### Requirement 15: Feature Status Persistence

**User Story:** As a system architect, I want feature toggle changes to persist immediately, so that businesses see changes in real-time.

#### Acceptance Criteria

1. WHEN SuperAdmin changes Feature_Toggle, THE System SHALL commit the change to the database immediately
2. WHEN Business_Owner refreshes their dashboard, THE System SHALL reflect the current Feature_Toggle value
3. WHEN Customer_App loads venue data, THE System SHALL reflect the current Feature_Toggle value
4. THE System SHALL not cache Feature_Toggle values longer than 5 minutes
5. WHEN Feature_Toggle changes, THE System SHALL invalidate any cached business or venue data
