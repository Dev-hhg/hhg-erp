
-- -- create a database called hhg
-- CREATE DATABASE IF NOT EXISTS hhg;

-- -- select to the database hhg

-- \c hhg;

-- CREATE SCHEMA public;

-- ALTER SCHEMA public OWNER TO hhg_owner;


-- Table: public.advertisement currently not used in application
CREATE TABLE IF NOT EXISTS public.advertisement
(
    advid serial NOT NULL,
    createdat timestamp without time zone DEFAULT now(),
    item character varying(255) COLLATE pg_catalog."default" NOT NULL,
    requiredweight numeric(10, 2),
    fulfilledweight numeric(10, 2) DEFAULT 0.00,
    askingprice numeric(10, 2) NOT NULL,
    fullfilment boolean DEFAULT false,
    requireddate timestamp without time zone,
    vyapariid integer,
    status character varying(50) COLLATE pg_catalog."default" DEFAULT 'Pending'::character varying,
    description text COLLATE pg_catalog."default",
    editedat timestamp without time zone DEFAULT now(),
    CONSTRAINT advertisement_pkey PRIMARY KEY (advid)
);

-- Table: public.deletedentry currently used in application but constraints are not added trigger can be added on delete entry from entry table
CREATE TABLE IF NOT EXISTS public.deletedentry
(
    transactionid integer NOT NULL,
    farmerid integer NOT NULL,
    vendorname character varying(30) COLLATE pg_catalog."default" NOT NULL,
    item character varying(20) COLLATE pg_catalog."default" NOT NULL,
    quantity integer NOT NULL,
    weight integer NOT NULL,
    transportrate integer,
    date date DEFAULT CURRENT_DATE,
    deletedon date DEFAULT CURRENT_DATE,
    "time" time without time zone DEFAULT CURRENT_TIME,
    rate integer DEFAULT 0,
    commision integer DEFAULT 0,
    payable integer DEFAULT 0,
    paid boolean DEFAULT false,
    paiddate date
);


-- Table: public.deletedfarmers currently used in application but constraints are not added trigger can be added on delete entry from farmers table
CREATE TABLE IF NOT EXISTS public.deletedfarmers
(
    farmerid integer NOT NULL,
    farmername character varying(155) COLLATE pg_catalog."default" NOT NULL,
    uid character varying(5) COLLATE pg_catalog."default" NOT NULL,
    mobilenumber character varying(10) COLLATE pg_catalog."default" NOT NULL,
    farmeraddress character varying(155) COLLATE pg_catalog."default",
    reason character varying(155) COLLATE pg_catalog."default",
    deletedon date DEFAULT CURRENT_DATE,
    "time" time without time zone DEFAULT CURRENT_TIME
);

-- Table: public.deletedrefunddata currently used in application but constraints are not added trigger can be added on delete entry from refund table
CREATE TABLE IF NOT EXISTS public.deletedrefunddata
(
    id serial NOT NULL,
    vendorname character varying(30) COLLATE pg_catalog."default" NOT NULL,
    date date NOT NULL,
    value integer DEFAULT 0,
    transportername character varying(30) COLLATE pg_catalog."default" NOT NULL,
    vehicleno character varying(30) COLLATE pg_catalog."default" NOT NULL,
    vmdata boolean DEFAULT false,
    printed boolean DEFAULT false,
    deltedon character varying(150) COLLATE pg_catalog."default" NOT NULL,
    CONSTRAINT deletedrefunddata_pkey PRIMARY KEY (id)
);

-- Table: public.entry currently used in application transportername is not used currently it is added to refund table, scanned is not used currently
CREATE TABLE IF NOT EXISTS public.entry
(
    transactionid serial NOT NULL,
    farmerid integer NOT NULL,
    vendorname character varying(30) COLLATE pg_catalog."default" NOT NULL,
    item character varying(20) COLLATE pg_catalog."default" NOT NULL,
    quantity integer NOT NULL,
    weight integer NOT NULL,
    transportrate integer DEFAULT 0,
    date date DEFAULT CURRENT_DATE,
    entrytime timestamp with time zone DEFAULT (now() AT TIME ZONE 'Asia/Kolkata'::text),
    postdated boolean DEFAULT false,
    edited boolean DEFAULT false,
    transportername character varying(100) COLLATE pg_catalog."default",
    scanned boolean DEFAULT false,
    CONSTRAINT entry_pkey PRIMARY KEY (transactionid)
);

-- Table: public.farmerinterest currently not used in application
CREATE TABLE IF NOT EXISTS public.farmerinterest
(
    interestid serial NOT NULL,
    advid integer,
    farmerid integer,
    interestedweight numeric(10, 2) NOT NULL,
    interesttime timestamp without time zone DEFAULT now(),
    status character varying(50) COLLATE pg_catalog."default" DEFAULT 'Pending'::character varying,
    adminnote text COLLATE pg_catalog."default",
    editedat timestamp without time zone DEFAULT now(),
    mobileno character varying(60) COLLATE pg_catalog."default" NOT NULL,
    farmername character varying(255) COLLATE pg_catalog."default",
    farmeraddress character varying(255) COLLATE pg_catalog."default",
    CONSTRAINT farmerinterest_pkey PRIMARY KEY (interestid)
);

-- Table: public.farmerpayments currently used in application used for advance payment to farmers
CREATE TABLE IF NOT EXISTS public.farmerpayments
(
    farmerpaymentid serial NOT NULL,
    farmerid integer NOT NULL,
    date date NOT NULL,
    "time" character varying(30) COLLATE pg_catalog."default" NOT NULL,
    amount integer NOT NULL,
    description character varying(155) COLLATE pg_catalog."default",
    paidtimestamp timestamp without time zone,
    paid boolean NOT NULL DEFAULT false,
    amountpaid integer NOT NULL DEFAULT 0,
    paymenttype character varying(50) COLLATE pg_catalog."default",
    paiddescription text COLLATE pg_catalog."default",
    collectedby character varying(50) COLLATE pg_catalog."default",
    paiddate date,
    CONSTRAINT farmerpayments_pkey PRIMARY KEY (farmerpaymentid)
);

-- Table: public.farmers currently used in application uid is 5 digit unique id for farmers
CREATE TABLE IF NOT EXISTS public.farmers
(
    farmerid serial NOT NULL,
    farmername character varying(155) COLLATE pg_catalog."default" NOT NULL,
    uid character varying(5) COLLATE pg_catalog."default" NOT NULL,
    mobilenumber character varying(10) COLLATE pg_catalog."default" NOT NULL,
    farmeraddress character varying(155) COLLATE pg_catalog."default",
    lastupdated timestamp with time zone DEFAULT now(),
    datejoined date NOT NULL DEFAULT CURRENT_DATE,
    status character varying(10) COLLATE pg_catalog."default" DEFAULT 'Active'::character varying,
    CONSTRAINT farmers_pkey PRIMARY KEY (farmerid),
    CONSTRAINT farmers_uid_key UNIQUE (uid)
);

-- Table: public.items currently only being used for name suggestion
CREATE TABLE IF NOT EXISTS public.items
(
    itemid serial NOT NULL,
    itemname character varying(255) COLLATE pg_catalog."default" NOT NULL,
    CONSTRAINT items_pkey PRIMARY KEY (itemid)
);

-- Table: public.last_logins tracks the last login of users for audit
CREATE TABLE IF NOT EXISTS public.last_logins
(
    id serial NOT NULL,
    user_id character varying(50) COLLATE pg_catalog."default" NOT NULL,
    device character varying(255) COLLATE pg_catalog."default" NOT NULL,
    login_time character varying(255) COLLATE pg_catalog."default" NOT NULL,
    CONSTRAINT last_logins_pkey PRIMARY KEY (id)
);

-- Table: public.localvyapari currently not used in application
CREATE TABLE IF NOT EXISTS public.localvyapari
(
    vyapariid serial NOT NULL,
    name character varying(255) COLLATE pg_catalog."default" NOT NULL,
    uid character varying(50) COLLATE pg_catalog."default" NOT NULL,
    address text COLLATE pg_catalog."default",
    mobile character varying(15) COLLATE pg_catalog."default",
    email character varying(255) COLLATE pg_catalog."default",
    joinedon timestamp without time zone DEFAULT now(),
    editedat timestamp without time zone DEFAULT now(),
    ratings numeric(3, 2) DEFAULT 0.0,
    totaldeals integer DEFAULT 0,
    CONSTRAINT localvyapari_pkey PRIMARY KEY (vyapariid),
    CONSTRAINT localvyapari_uid_key UNIQUE (uid)
);

-- Table: public.payment when vendor pays payment is added here
CREATE TABLE IF NOT EXISTS public.payment
(
    paymentid serial NOT NULL,
    vendorname character varying(30) COLLATE pg_catalog."default" NOT NULL,
    received integer DEFAULT 0,
    date date NOT NULL,
    modeofpayment character varying(255) COLLATE pg_catalog."default" DEFAULT NULL::character varying,
    "timestamp" timestamp without time zone DEFAULT now(),
    CONSTRAINT payment_pkey PRIMARY KEY (paymentid)
);

-- Table: public.refund currently used in application for refunding HHG from transporters via vendors. 
-- Only one refund per vendor per day. 
-- vmdata is used to check if data in vendormemo for the particular date and vendor is present
CREATE TABLE IF NOT EXISTS public.refund
(
    id serial NOT NULL,
    vendorname character varying(30) COLLATE pg_catalog."default" NOT NULL,
    date date NOT NULL,
    value integer DEFAULT 0,
    transportername character varying(30) COLLATE pg_catalog."default" NOT NULL,
    vehicleno character varying(30) COLLATE pg_catalog."default" NOT NULL,
    vmdata boolean DEFAULT false,
    printed boolean DEFAULT false,
    refundadded timestamp with time zone DEFAULT (now() AT TIME ZONE 'Asia/Kolkata'::text),
    CONSTRAINT refund_pkey PRIMARY KEY (id),
    CONSTRAINT unique_vendor_date UNIQUE (vendorname, date),
    CONSTRAINT unique_vendor_date_constraint UNIQUE (vendorname, date)
);

-- Table: public.users currently used in application for login
CREATE TABLE IF NOT EXISTS public.users
(
    id serial NOT NULL,
    username character varying(50) COLLATE pg_catalog."default" NOT NULL,
    password text COLLATE pg_catalog."default" NOT NULL,
    role character varying(50) COLLATE pg_catalog."default" NOT NULL,
    CONSTRAINT users_pkey PRIMARY KEY (id),
    CONSTRAINT users_username_key UNIQUE (username)
);

-- Table: public.vendor currently used in application galabumber is shop no with address, token_no is used for token system, vendornameshort is short name for vendor, vendorpriority is used for sorting
CREATE TABLE IF NOT EXISTS public.vendor
(
    vendorid serial NOT NULL,
    vendorname character varying(30) COLLATE pg_catalog."default" NOT NULL UNIQUE,
    mobilenumber character varying(10) COLLATE pg_catalog."default" NOT NULL,
    galanumber character varying(30) COLLATE pg_catalog."default" DEFAULT 'NA'::character varying,
    token_no character varying(50) COLLATE pg_catalog."default",
    vendornameshort character varying(50) COLLATE pg_catalog."default",
    vendorpriority smallint,
    CONSTRAINT vendor_pkey PRIMARY KEY (vendorid)
);

-- Table: public.vendormemo currently used in application for tracking monetory details of entries, 
-- rate is rate per 10 kg, payable is total amount to be paid, 
-- paid is true if payment is done, paiddate is date of payment, 
-- paid by is name of person who paid, paymenttype is mode of payment, with description of payment
CREATE TABLE IF NOT EXISTS public.vendormemo
(
    id serial NOT NULL,
    entryid integer NOT NULL UNIQUE,
    rate numeric(10, 2) DEFAULT 0,
    commision numeric(10, 2) DEFAULT 0,
    payable numeric(10, 2) DEFAULT 0,
    paid boolean DEFAULT false,
    paiddate date,
    patti_timestamp timestamp with time zone NOT NULL DEFAULT (now() AT TIME ZONE 'Asia/Kolkata'::text),
    paidtimestamp timestamp without time zone,
    paymenttype text COLLATE pg_catalog."default",
    edited timestamp without time zone[],
    description text COLLATE pg_catalog."default",
    paidby character varying(80) COLLATE pg_catalog."default",
    CONSTRAINT vendormemo_pkey PRIMARY KEY (id)
);

-- Table: public.whatsapp_messages currently not used in application used for sending messages to farmers in bulk
CREATE TABLE IF NOT EXISTS public.whatsapp_messages
(
    message_id serial NOT NULL,
    message text COLLATE pg_catalog."default" NOT NULL,
    active_date date NOT NULL,
    customer_type character varying(50) COLLATE pg_catalog."default" NOT NULL,
    CONSTRAINT whatsapp_messages_pkey PRIMARY KEY (message_id)
);


ALTER TABLE IF EXISTS public.entry
    ADD CONSTRAINT entry_farmerid_fkey FOREIGN KEY (farmerid)
    REFERENCES public.farmers (farmerid) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION;
CREATE INDEX IF NOT EXISTS idx_entry_farmerid
    ON public.entry(farmerid);


ALTER TABLE IF EXISTS public.vendormemo
    ADD FOREIGN KEY (entryid)
    REFERENCES public.entry (transactionid) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION
    NOT VALID;


ALTER TABLE IF EXISTS public.farmerpayments
    ADD CONSTRAINT farmerpayments_farmerid_fkey FOREIGN KEY (farmerid)
    REFERENCES public.farmers (farmerid) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.entry
    ADD FOREIGN KEY (farmerid)
    REFERENCES public.farmers (farmerid) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION
    NOT VALID;


ALTER TABLE IF EXISTS public.entry
    ADD FOREIGN KEY (vendorname)
    REFERENCES public.vendor (vendorname) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION
    NOT VALID;

--
-- Name: update_edited_column(); Type: FUNCTION; Schema: public; Owner: hhg_owner
--

CREATE FUNCTION public.update_edited_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND OLD.paid IS DISTINCT FROM NEW.paid THEN
    -- Append current timestamp in Asia/Kolkata timezone to the edited array
    NEW.edited := COALESCE(OLD.edited, '{}'::TIMESTAMP[]) || NOW() AT TIME ZONE 'Asia/Kolkata';
  END IF;
  RETURN NEW;
END;
$$;

CREATE FUNCTION public.update_paid_timestamp() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    IF NEW.paid THEN
        NEW.paidTimestamp = NOW();
    END IF;
    RETURN NEW;
END;
$$;

CREATE UNIQUE INDEX unique_vendor_dat ON public.refund USING btree (vendorname, date) WHERE (date IS NOT NULL);


CREATE MATERIALIZED VIEW public.vendor_item_rates AS
 WITH rankedvendors AS (
         SELECT e.date,
            e.vendorname,
            e.item,
            round(max((vm.rate / (10)::numeric)), 2) AS highest_rate,
            row_number() OVER (PARTITION BY e.date, e.item ORDER BY (max((vm.rate / (10)::numeric))) DESC) AS rank
           FROM (public.entry e
             JOIN public.vendormemo vm ON ((e.transactionid = vm.entryid)))
          WHERE ((vm.rate <> (0)::numeric) AND (e.date >= (CURRENT_DATE - '7 days'::interval)) AND (e.date <= CURRENT_DATE))
          GROUP BY e.date, e.vendorname, e.item
        )
 SELECT ((date + '1 day'::interval))::date AS date,
    vendorname,
    item,
    highest_rate
   FROM rankedvendors
  WHERE (rank <= 3)
  ORDER BY item, highest_rate DESC
  WITH NO DATA;

CREATE TRIGGER trigger_update_edited BEFORE UPDATE ON public.vendormemo FOR EACH ROW EXECUTE FUNCTION public.update_edited_column();

CREATE TRIGGER update_paid_timestamp_trigger BEFORE UPDATE OF paid ON public.vendormemo FOR EACH ROW EXECUTE FUNCTION public.update_paid_timestamp();

INSERT INTO public.users (username, password, role) 
VALUES
('guest_user', '$2a$10$TwliPe.pCKHLIA2CYGUjqOUta2g5bCOKdwN0DqcwABUXWe9ohyv2C', 'guest'),
('regular_user', '$2a$10$TwliPe.pCKHLIA2CYGUjqOUta2g5bCOKdwN0DqcwABUXWe9ohyv2C', 'user'),
('admin_user', '$2a$10$TwliPe.pCKHLIA2CYGUjqOUta2g5bCOKdwN0DqcwABUXWe9ohyv2C', 'admin'),
('super_admin', '$2a$10$TwliPe.pCKHLIA2CYGUjqOUta2g5bCOKdwN0DqcwABUXWe9ohyv2C', 'super-admin');


INSERT INTO public.vendor (vendorname, mobilenumber, galanumber, token_no, vendornameshort, vendorpriority) 
VALUES
('Sakharam Vishnu Shinde', '9876543210', 'Shop No. 12, Market Street', '1234', 'SVS', 1),
('Anita Dinesh Patil', '8765432109', 'Shop No. 45, Central Market', '5678', 'ADP', 2),
('Manoj Suresh Kale', '7654321098', 'Shop No. 30, Bazaar Road', '2345', 'MSK', 3),
('Ravi Ramchandra Jadhav', '6543210987', 'Shop No. 18, Main Road', '3456', 'RRJ', 4),
('Priya Mahesh Desai', '5432109876', 'Shop No. 7, High Street', '7890', 'PMD', 5),
('Rajesh Vinayak Pawar', '4321098765', 'Shop No. 21, Market Lane', '9012', 'RVP', 6),
('Sunita Harish Joshi', '3210987654', 'Shop No. 54, North Avenue', '6789', 'SHJ', 7);

INSERT INTO public.farmers (farmername, uid, mobilenumber, farmeraddress, status) 
VALUES
('Ram Shankar Yadav', '10001', '9876543210', 'Village A, District X', 'Active'),
('Suresh Gopal Patil', '10002', '8765432109', 'Village B, District Y', 'Active'),
('Amit Rajesh Deshmukh', '10003', '7654321098', 'Village C, District Z', 'Active'),
('Ravi Vinayak Gaikwad', '10004', '6543210987', 'Village D, District P', 'Active'),
('Neha Anil Kulkarni', '10005', '5432109876', 'Village E, District Q', 'Active'),
('Rohit Subhash Khandekar', '10006', '4321098765', 'Village F, District R', 'Active'),
('Meena Mahadev Naik', '10007', '3210987654', 'Village G, District S', 'Active'),
('Deepak Umesh Patekar', '10008', '2109876543', 'Village H, District T', 'Active'),
('Jyoti Ramesh Kadam', '10009', '1987654321', 'Village I, District U', 'Active'),
('Sachin Shrikant Phadke', '10010', '9876501234', 'Village J, District V', 'Active'),
('Varsha Sunil Shinde', '10011', '8765409876', 'Village K, District W', 'Active'),
('Prakash Balaji Jadhav', '10012', '7654301234', 'Village L, District X', 'Active'),
('Vaibhav Satish Gore', '10013', '6543209876', 'Village M, District Y', 'Active'),
('Kavita Mohan Joshi', '10014', '5432101234', 'Village N, District Z', 'Active'),
('Ashok Ravindra Thakur', '10015', '4321098765', 'Village O, District P', 'Active'),
('Manisha Vinod Pawar', '10016', '3210987654', 'Village P, District Q', 'Active'),
('Dinesh Ashok Kadve', '10017', '2109876543', 'Village Q, District R', 'Active'),
('Rajesh Mahendra Sawant', '10018', '1987654321', 'Village R, District S', 'Active'),
('Anita Nilesh Raut', '10019', '9876543210', 'Village S, District T', 'Active'),
('Mahesh Sudhir Jagtap', '10020', '8765432109', 'Village T, District U', 'Active');

INSERT INTO public.entry (farmerid, vendorname, item, quantity, weight, transportrate, date, entrytime, postdated, edited)
VALUES
-- Entries for 2024-10-19
(1, 'Sakharam Vishnu Shinde', 'Tomato', 2, 50, 100, '2024-10-19', '2024-10-19 10:00:00', false, false),
(2, 'Rajesh Vinayak Pawar', 'Potato', 3, 70, 140, '2024-10-19', '2024-10-19 11:00:00', false, true),
(3, 'Anita Dinesh Patil', 'Onion', 1, 40, 80, '2024-10-19', '2024-10-19 09:30:00', true, false),
(4, 'Priya Mahesh Desai', 'Carrot', 4, 60, 120, '2024-10-19', '2024-10-19 12:15:00', false, true),
(5, 'Sunita Harish Joshi', 'Spinach', 3, 75, 150, '2024-10-19', '2024-10-19 08:45:00', false, false),

-- Entries for 2024-10-18
(6, 'Sakharam Vishnu Shinde', 'Cabbage', 2, 40, 80, '2024-10-18', '2024-10-18 14:20:00', false, false),
(7, 'Rajesh Vinayak Pawar', 'Brinjal', 4, 60, 120, '2024-10-18', '2024-10-18 13:30:00', false, true),
(8, 'Anita Dinesh Patil', 'Pumpkin', 1, 70, 140, '2024-10-18', '2024-10-18 16:45:00', true, false),
(9, 'Priya Mahesh Desai', 'Cucumber', 5, 35, 70, '2024-10-18', '2024-10-18 15:50:00', false, false),
(10, 'Sunita Harish Joshi', 'Tomato', 2, 65, 130, '2024-10-18', '2024-10-18 10:10:00', false, true),

-- Entries for earlier in October
(11, 'Sakharam Vishnu Shinde', 'Potato', 1, 50, 100, '2024-10-15', '2024-10-15 09:00:00', true, false),
(12, 'Rajesh Vinayak Pawar', 'Onion', 3, 80, 160, '2024-10-15', '2024-10-15 08:30:00', false, true),
(13, 'Anita Dinesh Patil', 'Carrot', 4, 60, 120, '2024-10-14', '2024-10-14 14:40:00', false, false),
(14, 'Priya Mahesh Desai', 'Spinach', 5, 75, 150, '2024-10-14', '2024-10-14 12:10:00', true, true),
(15, 'Sunita Harish Joshi', 'Cabbage', 2, 30, 60, '2024-10-12', '2024-10-12 16:25:00', false, false),

-- More entries for other dates in October
(16, 'Sakharam Vishnu Shinde', 'Brinjal', 3, 55, 110, '2024-10-11', '2024-10-11 10:55:00', false, true),
(17, 'Rajesh Vinayak Pawar', 'Pumpkin', 4, 80, 160, '2024-10-10', '2024-10-10 11:45:00', false, false),
(18, 'Anita Dinesh Patil', 'Cucumber', 1, 35, 70, '2024-10-09', '2024-10-09 08:20:00', true, false),
(19, 'Priya Mahesh Desai', 'Tomato', 5, 60, 120, '2024-10-08', '2024-10-08 15:30:00', false, true),
(20, 'Sunita Harish Joshi', 'Potato', 2, 70, 140, '2024-10-07', '2024-10-07 13:10:00', false, false);


INSERT INTO public.refund (vendorname, transportername, vehicleno, value, date, printed, vmdata)
VALUES
('Sakharam Vishnu Shinde', 'Ravi Transport', 'MH12AB1234', 2 * 10, '2024-10-19', true, true),
('Rajesh Vinayak Pawar', 'Ravi Transport', 'MH12AB1234', 3 * 10, '2024-10-19', false, true),
('Anita Dinesh Patil', 'Ravi Transport', 'MH12AB1234', 1 * 10, '2024-10-19', true, true),
('Priya Mahesh Desai', 'Ravi Transport', 'MH12AB1234', 4 * 10, '2024-10-19', true, true),
('Sunita Harish Joshi', 'Ravi Transport', 'MH12AB1234', 3 * 10, '2024-10-19', true, true),
-- Refund for 2024-10-18
('Sakharam Vishnu Shinde', 'FedEx', 'DL01AB6969', 2 * 10, '2024-10-18', true, true),
('Rajesh Vinayak Pawar', 'FedEx', 'DL01AB6969', 4 * 10, '2024-10-18', true, true),
('Anita Dinesh Patil', 'FedEx', 'DL01AB6969', 1 * 10, '2024-10-18', true, true),
('Priya Mahesh Desai', 'FedEx', 'DL01AB6969', 5 * 10, '2024-10-18', true, true),
('Sunita Harish Joshi', 'FedEx', 'DL01AB6969', 2 * 10, '2024-10-18', true, true),
-- Refund for earlier in October
('Sakharam Vishnu Shinde', 'Delhivery', 'KA06GG0420', 1 * 10, '2024-10-15', true, true),
('Rajesh Vinayak Pawar', 'Delhivery', 'KA06GG0420', 3 * 10, '2024-10-15', true, true),
('Anita Dinesh Patil', 'Ravi Transport', 'MH12AB1234', 4 * 10, '2024-10-14', true, true),
('Priya Mahesh Desai', 'Ravi Transport', 'MH12AB1234', 5 * 10, '2024-10-14', true, true),
('Sunita Harish Joshi', 'Ravi Transport', 'MH12AB1234', 2 * 10, '2024-10-12', true, true),
-- Refund for other dates in October
('Sakharam Vishnu Shinde', 'Ravi Transport', 'MH12AB1234', 3 * 10, '2024-10-11', true, true),
('Rajesh Vinayak Pawar', 'Ravi Transport', 'MH12AB1234', 4 * 10, '2024-10-10', true, true),
('Anita Dinesh Patil', 'Ravi Transport', 'MH12AB1234', 1 * 10, '2024-10-09', true, true),
('Priya Mahesh Desai', 'Ravi Transport', 'MH12AB1234', 5 * 10, '2024-10-08', true, true),
('Sunita Harish Joshi', 'Ravi Transport', 'MH12AB1234', 2 * 10, '2024-10-07', true, true);

