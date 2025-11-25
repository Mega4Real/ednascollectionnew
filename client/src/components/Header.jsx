import React from 'react';

const Header = ({ filters, setFilters, clearFilters }) => {
    const handlePriceChange = (e) => {
        setFilters({ ...filters, price: e.target.value });
    };

    const handleSizeChange = (e) => {
        setFilters({ ...filters, size: e.target.value });
    };

    return (
        <header>
            <h1>Edna's Collections</h1>
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
                        <option value="XS">XS</option>
                        <option value="S">S</option>
                        <option value="M">M</option>
                        <option value="L">L</option>
                        <option value="XL">XL</option>
                        <option value="8">8</option>
                        <option value="12">12</option>
                    </select>
                </div>
                <button id="clear-filters" onClick={clearFilters}>Clear</button>
            </div>
        </header>
    );
};

export default Header;
