import { useState } from "react";
import { Search, Plus, ChevronDown, ChevronRight, Folder } from "lucide-react";

// Mock data for Phase 1 — represents requests within a single collection
const MOCK_GROUPS = [
	{
		id: "g1",
		name: "Authentication",
		requests: [
			{ id: 1, name: "Login", method: "POST", url: "/api/auth/login" },
			{ id: 2, name: "Signup", method: "POST", url: "/api/auth/signup" },
			{
				id: 3,
				name: "Get Profile",
				method: "GET",
				url: "/api/users/profile",
			},
		],
	},
];

const ApiSidebar = ({ selectedId, onSelect }) => {
	const [search, setSearch] = useState("");
	const [collapsed, setCollapsed] = useState({});

	const toggleGroup = (groupId) =>
		setCollapsed((prev) => ({ ...prev, [groupId]: !prev[groupId] }));

	// Flat-filter by search across all groups
	const filtered = MOCK_GROUPS.map((group) => ({
		...group,
		requests: group.requests.filter(
			(r) =>
				r.name.toLowerCase().includes(search.toLowerCase()) ||
				r.method.toLowerCase().includes(search.toLowerCase())
		),
	})).filter((g) => g.requests.length > 0);

	return (
		<aside className="cd-sidebar">
			{/* Search + New Request */}
			<div className="cd-sidebar-top">
				<div className="cd-search-wrapper">
					<Search className="cd-search-icon" size={13} />
					<input
						type="text"
						className="cd-search-input"
						placeholder="Search requests..."
						value={search}
						onChange={(e) => setSearch(e.target.value)}
					/>
				</div>
				<button className="cd-new-btn">
					<Plus size={13} />
					New Request
				</button>
			</div>

			{/* Grouped Request List */}
			<div className="cd-sidebar-list">
				{filtered.length === 0 ? (
					<p className="cd-sidebar-empty">No requests found.</p>
				) : (
					filtered.map((group) => {
						const isOpen = !collapsed[group.id];
						return (
							<div key={group.id} className="cd-group">
								{/* Group Header */}
								<div
									className="cd-group-header"
									onClick={() => toggleGroup(group.id)}
								>
									<span className="cd-group-icon">
										{isOpen ? (
											<ChevronDown size={12} />
										) : (
											<ChevronRight size={12} />
										)}
									</span>
									<Folder size={12} className="cd-group-icon" />
									{group.name}
								</div>

								{/* Requests inside group */}
								{isOpen && (
									<div className="cd-group-items">
										{group.requests.map((req) => (
											<div
												key={req.id}
												className={`cd-request-item${
													selectedId === req.id
														? " selected"
														: ""
												}`}
												onClick={() => onSelect(req)}
											>
												<span
													className={`cd-method-badge cd-method-${req.method}`}
												>
													{req.method}
												</span>
												<span className="cd-request-name">
													{req.name}
												</span>
											</div>
										))}
									</div>
								)}
							</div>
						);
					})
				)}
			</div>
		</aside>
	);
};

export default ApiSidebar;
