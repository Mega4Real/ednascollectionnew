import React from 'react';
import { Link } from 'react-router-dom';

const Header = ({ filters, setFilters, clearFilters }) => {
    const handlePriceChange = (e) => {
        setFilters({ ...filters, price: e.target.value });
    };

    const handleSizeChange = (e) => {
        setFilters({ ...filters, size: e.target.value });
    };

    return (
        <header>
            <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
                <h1>Erdnas Collections</h1>
            </Link>
            <div className="filters">
                <div className="filter-group">
                    <label htmlFor="price-filter">Price:</label>
                    <select id="price-filter" value={filters.price} onChange={handlePriceChange}>
                        <option value="">All Prices</option>
                        <option value="50-100">₵50 - ₵100</option>
                        <option value="100-200">₵100 - ₵200</option>
                        <option value="200-300">₵200 - ₵300</option>
                        <option value="300+">₵300+</option>
                    </select>
                </div>
                <div className="filter-group">
                    <label htmlFor="size-filter">Size:</label>
                    <select id="size-filter" value={filters.size} onChange={handleSizeChange}>
                        <option value="">All Sizes</option>
                        <option value="S">S</option>
                        <option value="M">M</option>
                        <option value="L">L</option>
                        <option value="XL">XL</option>
                        <option value="6">6</option>
                        <option value="8">8</option>
                        <option value="10">10</option>
                        <option value="12">12</option>
                        <option value="14">14</option>
                        <option value="16">16</option>
                        <option value="18">18</option>
                        <option value="6/8">6/8</option>
                        <option value="8/10">8/10</option>
                        <option value="10/12">10/12</option>
                        <option value="12/14">12/14</option>
                        <option value="14/16">14/16</option>
                        <option value="16/18">16/18</option>
                    </select>
                </div>
                <button id="clear-filters" onClick={clearFilters}>Clear</button>
            </div>
        </header>
    );
};

export default Header;
