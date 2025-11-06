import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { COLORS, SIZES, FONTS } from '../constants/theme';
import { FontAwesome } from '@expo/vector-icons';

const logo = require('../../assets/splash.png'); 

const renderStars = (rating) => {
  const stars = [];
  const roundedRating = Math.round((rating || 0) * 2) / 2;
  for (let i = 1; i <= 5; i++) {
    let name = "star-o";
    if (roundedRating >= i) name = "star";
    else if (roundedRating >= i - 0.5) name = "star-half-o";
    stars.push(<FontAwesome key={i} name={name} size={15} color={COLORS.accent} />); // Tamanho 15
  }
  return <View style={styles.starsContainer}>{stars}</View>;
};

const formatPrice = (price) => {
    if (!price) return 'N/A';
    
    const formattedPrice = price.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    });

    return formattedPrice;
};

const ServiceCard = ({ item, onPress }) => {
  return (
    <TouchableOpacity style={styles.cardContainer} onPress={onPress}>

      <View style={styles.leftColumn}>
        <Image source={logo} style={styles.logo} resizeMode="contain" />
      </View>

      <View style={styles.rightColumn}>
        
        <View style={styles.infoBlock}>
          <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
          <Text style={styles.categoryText}>{item.category}</Text>
          <Text style={styles.providerName}>
            por {item.providerId?.name || 'Prestador'}
          </Text>
        </View>

        <View style={styles.bottomRow}>
          <View style={styles.ratingContainer}>
            {renderStars(item.averageRating)}
            <Text style={styles.ratingCount}>({item.ratingsCount || 0})</Text>
          </View>
          <Text 
            style={styles.priceText} 
            numberOfLines={1} 
            adjustsFontSizeToFit={true} 
          >

           {formatPrice(item.price)}
            
          </Text>
        </View>  
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    padding: SIZES.padding * 0.75, 
    marginHorizontal: SIZES.padding,
    marginVertical: SIZES.base,
    flexDirection: 'row', 
    minHeight: 150, 
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  
  leftColumn: {
    width: 80, 
    height: 80, 
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SIZES.padding * 0.75,
    alignSelf: 'center', 
  },
  logo: {
    width: '100%',
    height: '100%',
  },
  
  rightColumn: {
    flex: 1, 
    justifyContent: 'space-between',
  },
  infoBlock: {
    
  },
  title: {
    ...FONTS.h3,
    color: COLORS.text,
    fontWeight: 'bold',
    fontSize: 20, 
    lineHeight: 22, 
    marginBottom: 10,
    marginTop:5
  },
  categoryText: {
    ...FONTS.body,
    color: COLORS.gray,
    fontSize: 13, 
    marginBottom: 10,
  },
  providerName: {
    ...FONTS.body,
    color: COLORS.gray,
    fontSize: 13, 
  },
  
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end', 
    marginTop: SIZES.base, 
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starsContainer: {
    flexDirection: 'row',
  },
  ratingCount: {
    ...FONTS.body,
    fontSize: 12,
    color: COLORS.gray,
    marginLeft: 4,
  },
  priceText: {
    ...FONTS.h3,
    color: COLORS.green,
    fontWeight: 'bold',
    fontSize: 18, 
    flexShrink: 1, 
    textAlign: 'right',
  },
});

export default ServiceCard;