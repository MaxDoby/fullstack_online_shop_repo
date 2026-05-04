import React from 'react';

interface ButtonProps {
	children: React.ReactNode;
	onClick?: () => void;
	disabled?: boolean;
	className?: string;
}

const Button = ({
	children, onClick, disabled, className = 'btn-filter',
}: ButtonProps) => (
	<button
		type="button"
		className={className}
		onClick={onClick}
		disabled={disabled}
		style={{ cursor: disabled ? 'not-allowed' : 'pointer' }}
	>
		{children}
	</button>
);

export default Button;
