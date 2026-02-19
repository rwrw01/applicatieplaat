CREATE SCHEMA IF NOT EXISTS keycloak;
CREATE SCHEMA IF NOT EXISTS app;

CREATE TABLE IF NOT EXISTS app.organisaties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  naam VARCHAR(255) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  actief BOOLEAN DEFAULT true,
  aangemaakt_op TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS app.gebruikers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  keycloak_id VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) NOT NULL,
  naam VARCHAR(255),
  rol VARCHAR(50) DEFAULT 'gebruiker',
  organisatie_id UUID REFERENCES app.organisaties(id),
  aangemaakt_op TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS app.applicaties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisatie_id UUID NOT NULL REFERENCES app.organisaties(id),
  cluster VARCHAR(255),
  naam VARCHAR(255) NOT NULL,
  saas BOOLEAN DEFAULT false,
  complexiteit VARCHAR(50),
  afloopdatum DATE,
  omgeving VARCHAR(50),
  status VARCHAR(50),
  leverancier VARCHAR(255),
  extra_velden JSONB DEFAULT '{}',
  aangemaakt_op TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS app.veld_definities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisatie_id UUID NOT NULL REFERENCES app.organisaties(id),
  label VARCHAR(255) NOT NULL,
  sleutel VARCHAR(100) NOT NULL,
  type VARCHAR(50) NOT NULL,
  zichtbaar BOOLEAN DEFAULT true,
  volgorde INTEGER DEFAULT 0,
  max_lengte INTEGER,
  aangemaakt_op TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS app.icoon_mappings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  veld_id UUID NOT NULL REFERENCES app.veld_definities(id) ON DELETE CASCADE,
  waarde VARCHAR(255) NOT NULL,
  icoon VARCHAR(255),
  kleur VARCHAR(50)
);

INSERT INTO app.organisaties (naam, slug) VALUES ('Gemeente Gouda', 'gouda') ON CONFLICT DO NOTHING;
